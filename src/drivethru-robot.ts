import { RobotControllerBase, PinMode, IPortInformation } from "@bbfrc/drivethru";

export class DrivethruRobotController extends RobotControllerBase {

    private _emit: Function;

    constructor(emitFn: Function) {
        super();

        this._emit = emitFn;
        setTimeout(() => {
            this.emit("ready");
        }, 1000);
    }

    get totalPhysicalPins(): number {
        return 0;
    }

    get digitalPins(): IPortInformation[] {
        return [];
    }

    get analogPins(): IPortInformation[] {
        return [];
    }

    get servoPins(): IPortInformation[] {
        return [];
    }

    reset(): void {

    }

    setDigitalPinMode(port: number, mode: PinMode): void {

    }
    getDigitalValue(port: number): boolean {
        return false;
    }
    setDigitalValue(port: number, value: boolean): void {

    }
    setServoValue(port: number, value: number): void {
        if (port === 0 || port === 1) {
            const speedVal = ((value / 180.0) * 2) - 1.0;
            this._emit("pwm", {
                port,
                value: speedVal
            });
        }
    }
    getAnalogValue(port: number): number {
        return 0;
    }
    subscribeToAnalogValue(port: number, value: boolean): void {

    }
    subscribeToDigitalValue(port: number, value: boolean): void {

    }


}
