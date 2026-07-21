#include <esp_camera.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiManager.h>
#include <Preferences.h>

#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

Preferences preferences;
String backendUrl = "";

void startCameraServer();
void setupLedFlash(int pin);

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  // ==================== CAMERA SETUP ====================
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  if (config.pixel_format == PIXFORMAT_JPEG) {
    if (psramFound()) {
      config.jpeg_quality = 10;
      config.fb_count = 2;
      config.grab_mode = CAMERA_GRAB_LATEST;
    } else {
      config.frame_size = FRAMESIZE_SVGA;
      config.fb_location = CAMERA_FB_IN_DRAM;
    }
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return;
  }

  sensor_t *s = esp_camera_sensor_get();
  if (s->id.PID == OV3660_PID) {
    s->set_vflip(s, 1);
    s->set_brightness(s, 1);
    s->set_saturation(s, -2);
  }
  if (config.pixel_format == PIXFORMAT_JPEG) {
    s->set_framesize(s, FRAMESIZE_QVGA);
  }

#if defined(LED_GPIO_NUM)
  setupLedFlash(LED_GPIO_NUM);
#endif

  // ==================== WIFI + BACKEND URL ====================
  preferences.begin("redeye-camera", false);
  backendUrl = preferences.getString("backendUrl", "");

  WiFiManagerParameter backendParam("backend", "Backend URL", backendUrl.c_str(), 120);

  WiFiManager wifiManager;
  wifiManager.addParameter(&backendParam);
  wifiManager.setConfigPortalTimeout(180);
  wifiManager.setConnectTimeout(20);

  Serial.println("Connecting to WiFi...");

  bool connected = wifiManager.autoConnect("redeye-camera-setup");

  if (!connected) {
    Serial.println("Failed to connect - starting config portal");
    wifiManager.startConfigPortal("redeye-camera-setup");
  }

  backendUrl = backendParam.getValue();
  if (backendUrl.length() > 0 && backendUrl != "http://") {
    preferences.putString("backendUrl", backendUrl);
    Serial.println("Backend URL saved: " + backendUrl);
  }
  preferences.end();

  WiFi.setSleep(false);

  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Backend URL: ");
  Serial.println(backendUrl);

  startCameraServer();
  Serial.println("Camera server started on http://" + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost. Reconnecting...");
    WiFi.reconnect();
    delay(5000);
    return;
  }

  if (backendUrl.length() == 0) {
    delay(10000);
    return;
  }

  HTTPClient http;
  http.begin(backendUrl + "/api/camera/heartbeat");
  http.addHeader("Content-Type", "application/json");

  String body = "{\"ip\":\"" + WiFi.localIP().toString() + "\"}";

  int responseCode = http.POST(body);

  if (responseCode > 0) {
    Serial.printf("Heartbeat OK: %d\n", responseCode);
  } else {
    Serial.printf("Heartbeat failed: %s\n", http.errorToString(responseCode).c_str());
  }

  http.end();
  delay(10000);
}