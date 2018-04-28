/**
 * KSB038 V0.010
 */
//% weight=10 color=#0000f0 icon="\uf085" block="KSB038"
namespace KSB038 {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09
    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD
	

	
	export enum Servos {
		S1 = 0x01,
		S2 = 0x02,
		S3 = 0x03,
		S4 = 0x04,
		S5 = 0x05,
		S6 = 0x06,
		S7 = 0x07,
		S8 = 0x08
	}
	

    let initialized = false
	
    function i2cwrite(reg: number, value: number) {
		let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf)
    }

	function i2cread(reg: number){
		pins.i2cWriteNumber(PCA9685_ADDRESS, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(PCA9685_ADDRESS, NumberFormat.UInt8BE);
        return val;
	}

    function initPCA9685(): void {
		i2cwrite(MODE1, 0x00)
        setFreq(50);
        initialized = true
    }
	
	function setFreq(freq: number): void {
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
	}
	
	function setPwm(channel: number, on: number, off: number): void {
		if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on>>8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off>>8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
	}	

	
	//% blockId=robotbit_servo block="Servo|%index|degree %degree"
	//% weight=100
	//% blockGap=50
	//% degree.min=0 degree.max=180
	//% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
	export function Servo(index: Servos, degree: number): void {
		if(!initialized){
			initPCA9685()
		}
		// 50hz: 20,000 us
        let v_us = (degree*1800/180+600) // 0.6 ~ 2.4
        let value = v_us*4096/20000
        setPwm(index+7, 0, value)
    }
	


}
