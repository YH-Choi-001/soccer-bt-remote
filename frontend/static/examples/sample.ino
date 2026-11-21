/**
 * @file sample.ino - A sample program to transform the remote control signals into motion.
 * To be used with https://sbrc.yhchoi.top/ .
 * 
 * @copyright (c) 2026, YH Choi
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 */

// the serial connected to bluetooth
HardwareSerial &btSerial = Serial1;
const unsigned long btSerialBaudRate = 9600;

unsigned long lastUpdatedMillis;

void startRobot() {
  // robot-specific, to be implemented
}

/**
 * The heading should start with 0 when facing forward, and increase clockwise.
 * @return The current heading of the robot [0 : 359].
 */
int getHeading() {
  // robot-specific, to be implemented
  return 0;
}

/**
 * Tell the robot how to move.
 * @param linearMotionDirection The direction of linear motion [0 : 359]. 0 is forward, and increase clockwise.
 * @param linearSpeed The speed of the linear motion [0 : +255].
 * @param rotationSpeed The speed of rotation motion [-255 : +255]. Positive values indicate clockwise rotation.
 */
void setMotion(
    const int linearMotionDirection,
    const int linearSpeed,
    const int rotationSpeed)
{
  // robot-specific, to be implemented
}

void stop() {
  setMotion(0, 0, 0);
}

int getRotationSpeed(const int targetHeading) {
  int relativeHeading = getHeading() - targetHeading;
  // convert to [-180 : +180]
  while (relativeHeading < -180) {
    relativeHeading += 360;
  }
  while (relativeHeading > 180) {
    relativeHeading -= 360;
  }

  return -relativeHeading * 1.2;
}

void parseNewMotion(const String line) {
  if (line.charAt(0) != 'A'
    || line.charAt(4) != 'S'
    || line.charAt(8) != 'H'
    || line.charAt(12) != 'E'
    || line.length() != 13) {
    return;
  }

  const int linearMotionDirection = line.substring(1, 4).toInt();
  const int linearSpeed = line.substring(5, 8).toInt();
  const int targetHeading = line.substring(9, 12).toInt();

  const int rotationSpeed = getRotationSpeed(targetHeading);
  setMotion(linearMotionDirection, linearSpeed, rotationSpeed);

  lastUpdatedMillis = millis();

  Serial.print("angle: ");
  Serial.print(linearMotionDirection);
  Serial.print("\tspeed: ");
  Serial.print(linearSpeed);
  Serial.print("\theading: ");
  Serial.print(targetHeading);
  Serial.println();
}

void setup() {
  lastUpdatedMillis = 0;
  Serial.begin(9600);
  btSerial.begin(btSerialBaudRate);
  startRobot();
}

void loop() {
  if (btSerial.available()) {
    const String line = btSerial.readStringUntil('\n');
    parseNewMotion(line);
  }

  if (millis() - lastUpdatedMillis > 1500) {
    // Didn't receive a new packet for 1.5 seconds.
    // Maybe the bluetooth is silently disconnected,
    // so we stop.
    stop();
  }
}
