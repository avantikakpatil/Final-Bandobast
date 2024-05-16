#include <SoftwareSerial.h>

// Define the RX and TX pins for the GPS module
const int RX_PIN = 4;  // Connect GPS TX to this pin
const int TX_PIN = 5;  // Connect GPS RX to this pin

SoftwareSerial gpsSerial(RX_PIN, TX_PIN);

void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);  // Initialize SoftwareSerial for GPS communication
}

void loop() {
  // Check if data is available from the GPS module
  if (gpsSerial.available()) {
    // Read the incoming byte from the GPS module
    char c = gpsSerial.read();
    // Print the byte to the serial monitor
    Serial.write(c);
  }
}
