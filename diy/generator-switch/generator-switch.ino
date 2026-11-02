// Generator remote start: the ESP32 makes its own Wi-Fi network, serves a page
// at http://192.168.4.1 and closes a relay wired across the start button's two wires.

#include <WiFi.h>
#include <WebServer.h>

const char* AP_NAME = "Generator";
const char* AP_PASS = "change-me-123";        // change this, 8 characters or more

const int START_PIN = 26;                     // relay IN1
const bool RELAY_ACTIVE_LOW = true;           // most blue relay boards switch on LOW
const unsigned long DEFAULT_CRANK_MS = 2000;
const unsigned long MAX_CRANK_MS = 4000;      // never hold the starter longer than this
const unsigned long COOLDOWN_MS = 10000;      // rest between attempts to protect the starter

WebServer server(80);
bool cranking = false;
bool crankedBefore = false;
unsigned long crankStart = 0;
unsigned long crankLength = 0;
unsigned long lastCrankEnd = 0;
unsigned int attempts = 0;

void setRelay(bool on) {
  digitalWrite(START_PIN, (on != RELAY_ACTIVE_LOW) ? HIGH : LOW);
}

void stopCrank() {
  setRelay(false);
  if (cranking) {
    cranking = false;
    lastCrankEnd = millis();
  }
}

unsigned long cooldownLeft() {
  if (!crankedBefore || cranking) return 0;
  unsigned long since = millis() - lastCrankEnd;
  return since >= COOLDOWN_MS ? 0 : COOLDOWN_MS - since;
}

void sendStatus() {
  String json = "{\"cranking\":";
  json += cranking ? "true" : "false";
  json += ",\"cooldown\":";
  json += String((cooldownLeft() + 999) / 1000);
  json += ",\"attempts\":";
  json += String(attempts);
  json += "}";
  server.send(200, "application/json", json);
}

void handleStart() {
  if (cranking || cooldownLeft() > 0) {
    sendStatus();
    return;
  }
  unsigned long ms = DEFAULT_CRANK_MS;
  if (server.hasArg("ms")) ms = server.arg("ms").toInt();
  if (ms < 500) ms = 500;
  if (ms > MAX_CRANK_MS) ms = MAX_CRANK_MS;

  crankLength = ms;
  crankStart = millis();
  cranking = true;
  crankedBefore = true;
  attempts++;
  setRelay(true);
  sendStatus();
}

void handleRelease() {
  stopCrank();
  sendStatus();
}

const char PAGE[] PROGMEM = R"rawliteral(<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Generator</title>
<style>
  body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
       gap:22px;background:#15171a;color:#e8e6e1;font-family:system-ui,sans-serif}
  #go{width:220px;height:220px;border-radius:50%;border:0;background:#2f7d4f;color:#fff;font-size:30px;
      font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.5)}
  #go:disabled{background:#4a4d52;color:#9a9a9a}
  #go.on{background:#c7772a}
  select,#rel{font-size:18px;padding:8px 14px;border-radius:8px;border:1px solid #444;background:#22252a;color:#e8e6e1}
  #msg{font-size:18px;min-height:24px}
</style></head><body>
<button id="go">START</button>
<div id="msg">Ready</div>
<label>Crank for
  <select id="ms"><option value="1000">1 s</option><option value="2000" selected>2 s</option>
  <option value="3000">3 s</option><option value="4000">4 s</option></select></label>
<button id="rel">Release now</button>
<script>
const go=document.getElementById('go'),msg=document.getElementById('msg');
function show(s){
  go.classList.toggle('on',s.cranking);
  go.disabled=s.cranking||s.cooldown>0;
  msg.textContent=s.cranking?'Cranking...':s.cooldown>0?'Wait '+s.cooldown+' s':
    (s.attempts?'Ready (attempts: '+s.attempts+')':'Ready');
}
function call(p){fetch(p).then(r=>r.json()).then(show).catch(()=>msg.textContent='Not connected');}
go.onclick=()=>call('/start?ms='+document.getElementById('ms').value);
document.getElementById('rel').onclick=()=>call('/release');
setInterval(()=>call('/status'),700);call('/status');
</script></body></html>)rawliteral";

void setup() {
  pinMode(START_PIN, OUTPUT);
  setRelay(false);

  Serial.begin(115200);
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_NAME, AP_PASS);
  Serial.print("Open http://");
  Serial.println(WiFi.softAPIP());

  server.on("/", []() { server.send(200, "text/html", PAGE); });
  server.on("/start", handleStart);
  server.on("/release", handleRelease);
  server.on("/status", sendStatus);
  server.begin();
}

void loop() {
  server.handleClient();
  if (cranking && millis() - crankStart >= crankLength) stopCrank();
}
