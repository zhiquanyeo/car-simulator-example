
export enum Steer { LEFT, RIGHT, NONE };
export enum Control { FORWARD, BRAKE, NONE };

export interface TopDownCarSim {
    update(ms: number);
    setSteer(steer: Steer);
    setControl(control: Control);
};

export interface SimObject {
    update(pos: { x: number, y: number }, angle: number): void;
    deleted(): void;
};

export class ObjectSpec {
    constructor(
        public position: { x: number, y: number },
        public angle: number,
        public height: number,
        public width: number) { }

    object: SimObject;
}

export class WheelObjectSpec extends ObjectSpec {
    powered: boolean;
    steering: boolean;
}

export class TopDownCarSpec {
    body: ObjectSpec;
    wheels: WheelObjectSpec[];

    constructor(carObject: SimObject, wheelObjects: SimObject[]) {
        this.body = new ObjectSpec({ x: 0, y: 0 }, 0, 4, 2);

        this.body.object = carObject;

        this.wheels = new Array();

        this.wheels.push(new WheelObjectSpec({ x: -1, y: -1.2 }, 0, 0.8, 0.4));
        this.wheels.push(new WheelObjectSpec({ x: 1, y: -1.2 }, 0, 0.8, 0.4));
        this.wheels.push(new WheelObjectSpec({ x: -1, y: 1.2 }, 0, 0.8, 0.4));
        this.wheels.push(new WheelObjectSpec({ x: 1, y: 1.2 }, 0, 0.8, 0.4));

        this.wheels[0].powered = this.wheels[1].powered = true;
        this.wheels[2].powered = this.wheels[3].powered = false;

        this.wheels[0].steering = this.wheels[1].steering = true;
        this.wheels[2].steering = this.wheels[3].steering = false;

        this.wheels[0].object = wheelObjects[0];
        this.wheels[1].object = wheelObjects[1];
        this.wheels[2].object = wheelObjects[2];
        this.wheels[3].object = wheelObjects[3];
    }
}