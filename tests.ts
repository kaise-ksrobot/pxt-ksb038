let controller = KSB038.chipAddress("0x40")
input.onButtonPressed(Button.A, () => {
    KSB038.setServoPosition(KSB038.ServoNum.Servo1, 0, controller)
    basic.showString("A")
})
input.onButtonPressed(Button.B, () => {
    KSB038.setServoPosition(KSB038.ServoNum.Servo1, 180, controller)
    basic.showString("B")
})
input.onButtonPressed(Button.AB, () => {
    KSB038.setServoPosition(KSB038.ServoNum.Servo1, 90, controller)
    basic.showString("C")
})
basic.showNumber(controller)
KSB038.init(controller, 60)
