import { Vec2, Body, World, Box, RevoluteJoint, PrismaticJoint } from 'planck-js';
import { WheelObjectSpec, Steer, Control, ObjectSpec, TopDownCarSpec, SimObject } from './carinterface';

class SimWall {
    body: Body;

    constructor(spec: ObjectSpec, world: World) {
        this.body = world.createBody({
            position: new Vec2(spec.position),
            type: 'static',
            angle: spec.angle
        });

        this.body.createFixture({
            shape: new Box(spec.width / 2, spec.height / 2),
            density: 1,
            isSensor: false
        });
    }
}

class SimWheel {
    pos: Vec2;
    steering: boolean;
    powered: boolean;
    body: Body;
    carbody: Body;

    width: number;
    height: number;

    constructor(
        spec: WheelObjectSpec,

        carbody: Body,
        world: World
    ) {
        this.steering = spec.steering;
        this.powered = spec.powered;
        this.carbody = carbody;
        this.pos = new Vec2(spec.position);

        this.width = spec.width;
        this.height = spec.height;

        let position = carbody.getWorldPoint(this.pos);

        this.body = world.createBody({
            position: position,
            type: 'dynamic',
            angle: carbody.getAngle()
        });

        this.body.createFixture({
            shape: new Box(spec.height / 2, spec.width / 2),
            density: 1,
            isSensor: false
        });

        if (this.steering) {
            world.createJoint(new RevoluteJoint({ enableMotor: false }, carbody, this.body, this.pos));
        } else {
            world.createJoint(new PrismaticJoint({ enableLimit: true, lowerTranslation: 0, upperTranslation: 0 }, carbody, this.body, this.body.getWorldCenter(), new Vec2(1, 0)));
        }

        this.body.setUserData(spec.object);
    }

    setAngle(angle: number): void {
        this.body.setAngle(this.carbody.getAngle() + angle);
    }

    killSidewaysVelocity(): void {
        let v = this.carbody.getLinearVelocityFromLocalPoint(this.pos);
        let f = this.body.getWorldVector(new Vec2(1, 0));

        let force = f.mul(5 * -1 * Vec2.dot(v, f));
        this.body.applyForce(force, this.body.getWorldCenter(), true);
    }
}

class SimCar {
    body: Body;
    wheels: SimWheel[];

    max_wheel_angle: number;
    wheel_angle: number;

    steer: Steer;
    control: Control;

    constructor(spec: ObjectSpec, wheelSpecs: WheelObjectSpec[], world: World) {
        this.body = world.createBody({
            type: 'dynamic',
            position: new Vec2(spec.position),
            angle: spec.angle,
            linearDamping: 0.5,
            bullet: true,
            angularDamping: 0.3
        });

        this.body.createFixture({
            shape: new Box(spec.width / 2, spec.height / 2),
            density: 1, isSensor: false, friction: 0.3, restitution: 0.4
        });

        this.wheels = wheelSpecs.map(spec => new SimWheel(spec, this.body, world));

        this.steer = Steer.NONE;
        this.max_wheel_angle = 0.35;

        this.body.setUserData(spec.object);
    }

    update(ms: number): void {
        let incr = this.max_wheel_angle * ms * 6;

        if (this.steer == Steer.RIGHT) {
            this.wheel_angle = Math.min(Math.max(this.wheel_angle, 0) + incr, this.max_wheel_angle)
        } else if (this.steer == Steer.LEFT) {
            this.wheel_angle = Math.max(Math.min(this.wheel_angle, 0) - incr, -this.max_wheel_angle)
        } else {
            this.wheel_angle = 0;
        }

        let forceMag = 0;
        if (this.control == Control.FORWARD) {
            forceMag = -40;
        } else if (this.control == Control.BRAKE) {
            forceMag = 35;
        }

        for (let wheel of this.wheels) {
            wheel.killSidewaysVelocity();
            if (wheel.steering) {
                wheel.setAngle(this.wheel_angle);
            }
            if (wheel.powered) {
                let force = wheel.body.getWorldVector(new Vec2(0, 1));
                force.mul(forceMag);
                wheel.body.applyForce(force, wheel.body.getWorldCenter());
            }
        }
    }
}

export class TopDownCarSim {
    world: World;
    car: SimCar;
    walls: SimWall[];

    constructor(spec: TopDownCarSpec) {
        let gravity = new Vec2(0, 0);
        this.world = new World(gravity);
        this.car = new SimCar(spec.body, spec.wheels, this.world);
        this.walls = spec.walls.map(wall => new SimWall(wall, this.world));
    }

    updateBody(body: Body) {
        let obj = body.getUserData();
        if (obj !== undefined) {
            let simobj = <SimObject>obj;

            simobj.update(body.getWorldCenter(), body.getAngle());
        }
    }

    setControl(control: Control) { this.car.control = control; }

    setSteer(steer: Steer) { this.car.steer = steer; }

    update(ms: number) {
        this.car.update(ms);
        this.world.step(ms, 10, 8);
        this.world.clearForces();

        this.updateBody(this.car.body);
        for (let wheel of this.car.wheels) {
            this.updateBody(wheel.body);
        }
    }
}