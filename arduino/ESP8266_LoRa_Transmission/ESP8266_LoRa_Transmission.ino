#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <LoRa.h>

#define SS 15
#define RST 16
#define DIO0 2

const char *ssid = "realme 7";
const char *password = "11223344";
const char *serverIP = "192.168.229.129";
const int serverPort = 80;
const int loraFrequency = 433E6;

WiFiClient wifiClient;

void setup() {
  Serial.begin(9600);
  while (!Serial);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to Wi-Fi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Initialize LoRa
  Serial.println("Sender Host");
  LoRa.setPins(SS, RST, DIO0);
  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa Error");
    delay(100);
    while (1);
  }
}

void loop() {
  // Retrieve data from the server
  String receivedData = getDataFromServer();

  // Transmit data via LoRa
  if (receivedData != "") {
    Serial.print("Sending Data via LoRa: ");
    Serial.println(receivedData);
    LoRa.beginPacket();
    LoRa.print(receivedData);
    LoRa.endPacket();
  } else {
    Serial.println("Failed to retrieve data from the server");
  }

  delay(3000);
}

String getDataFromServer() {
  String data;
  HTTPClient http;

  if (http.begin(wifiClient, "http://" + String(serverIP) + ":" + String(serverPort) + "/gps")) {
    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      data = http.getString();
      Serial.println("Data received from server: " + data);
    } else {
      Serial.print("HTTP Request failed. Response code: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("Unable to connect to server");
  }

  return data;
} 
