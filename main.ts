/**
 * KSB038 V0.010
 */
//% weight=10 color=#0000f0 icon="\uf085" block="KSB038"
namespace KSB038 {
    const IIC_ADDRESS = 0x40
    const MODE1 = 0x00
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
 	
    export enum ServoNum {
        Servo0 = 0,
        Servo1 = 1,
        Servo2 = 2,
        Servo3 = 3,
        Servo4 = 4,
        Servo5 = 5,
        Servo6 = 6,
        Servo7 = 7,
        Servo8 = 8,
        Servo9 = 9,
        Servo10 = 10,
        Servo11 = 11,
        Servo12 = 12,
        Servo13 = 13,
        Servo14 = 14,
        Servo15 = 15,
        
    }


    let initialized = false
	
    function i2cwrite(reg: number, value: number) {
		let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(IIC_ADDRESS, buf)
    }

	function i2cread(reg: number){
		pins.i2cWriteNumber(IIC_ADDRESS, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(IIC_ADDRESS, NumberFormat.UInt8BE);
        return val;
	}

    function init(): void {
		i2cwrite(MODE1, 0x00)
        let freq=50;
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(MODE1);        
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(MODE1, newmode); // go to sleep
        i2cwrite(PRESCALE, prescale); // set the prescaler
        i2cwrite(MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(MODE1, oldmode | 0xa1);
        initialized = true
    }
	
	
	/**
     * Used to move the given servo to the specified degrees (0-180) connected to the KSB038
     * @param servoNum The number (1-16) of the servo to move
     * @param degrees The degrees (0-180) to move the servo to
     */
    //% block 
	export function Servo(channel: ServoNum, degree: number): void {
		if(!initialized){
			init()
		}
		// 50hz: 20,000 us
        let v_us = (degree*1800/180+600) // 0.6 ~ 2.4
        let value = v_us*4096/20000
        
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = 0;
        buf[2] = (0>>8);
        buf[3] = value & 0xff;
        buf[4] = (value>>8) & 0xff;
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
    }
	


}
