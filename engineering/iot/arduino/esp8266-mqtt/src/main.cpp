#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <time.h>
#include <math.h>

#include "config.h"

// --- Vietnamese solar->lunar calendar conversion ---
// Standard public-domain astronomical algorithm (Ho Ngoc Duc), used in most
// Vietnamese lunar calendar tools. Works in Julian day numbers; timeZone is
// hours offset (7 for Vietnam).
namespace VnLunar {
    const double PI_ = 3.14159265358979323846;

    long jdFromDate(int dd, int mm, int yy) {
        long a = (14 - mm) / 12;
        long y = yy + 4800 - a;
        long m = mm + 12 * a - 3;
        long jd = dd + (153 * m + 2) / 5 + 365L * y + y / 4 - y / 100 + y / 400 - 32045;
        if (jd < 2299161) {
            jd = dd + (153 * m + 2) / 5 + 365L * y + y / 4 - 32083;
        }
        return jd;
    }

    double newMoon(int k) {
        double T = k / 1236.85;
        double T2 = T * T;
        double T3 = T2 * T;
        double dr = PI_ / 180;
        double Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
        Jd1 += 0.00033 * sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
        double M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
        double Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
        double F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
        double C1 = (0.1734 - 0.000393 * T) * sin(M * dr) + 0.0021 * sin(2 * dr * M);
        C1 = C1 - 0.4068 * sin(Mpr * dr) + 0.0161 * sin(dr * 2 * Mpr);
        C1 = C1 - 0.0004 * sin(dr * 3 * Mpr);
        C1 = C1 + 0.0104 * sin(dr * 2 * F) - 0.0051 * sin(dr * (M + Mpr));
        C1 = C1 - 0.0074 * sin(dr * (M - Mpr)) + 0.0004 * sin(dr * (2 * F + M));
        C1 = C1 - 0.0004 * sin(dr * (2 * F - M)) - 0.0006 * sin(dr * (2 * F + Mpr));
        C1 = C1 + 0.0010 * sin(dr * (2 * F - Mpr)) + 0.0005 * sin(dr * (2 * Mpr + M));
        double deltat = (T < -11)
            ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
            : -0.000278 + 0.000265 * T + 0.000262 * T2;
        return Jd1 + C1 - deltat;
    }

    double sunLongitude(double jdn) {
        double T = (jdn - 2451545.0) / 36525;
        double T2 = T * T;
        double dr = PI_ / 180;
        double M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
        double L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
        double DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * sin(dr * M);
        DL = DL + (0.019993 - 0.000101 * T) * sin(dr * 2 * M) + 0.000290 * sin(dr * 3 * M);
        double L = L0 + DL;
        L = L * dr;
        L = L - PI_ * 2 * (floor(L / (PI_ * 2)));
        return L;
    }

    int getSunLongitudeSextant(long dayNumber, int timeZone) {
        return (int)(sunLongitude(dayNumber - 0.5 - timeZone / 24.0) / PI_ * 6);
    }

    long getNewMoonDay(int k, int timeZone) {
        return (long)floor(newMoon(k) + 0.5 + timeZone / 24.0);
    }

    long getLunarMonth11(int yy, int timeZone) {
        double off = jdFromDate(31, 12, yy) - 2415021.076998695;
        int k = (int)floor(off / 29.530588853);
        long nm = getNewMoonDay(k, timeZone);
        int sunLong = getSunLongitudeSextant(nm, timeZone);
        if (sunLong >= 9) {
            nm = getNewMoonDay(k - 1, timeZone);
        }
        return nm;
    }

    int getLeapMonthOffset(long a11, int timeZone) {
        int k = (int)floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
        int last = 0;
        int i = 1;
        int arc = getSunLongitudeSextant(getNewMoonDay(k + i, timeZone), timeZone);
        do {
            last = arc;
            i++;
            arc = getSunLongitudeSextant(getNewMoonDay(k + i, timeZone), timeZone);
        } while (arc != last && i < 14);
        return i - 1;
    }

    void convertSolar2Lunar(int dd, int mm, int yy, int timeZone,
                             int* lunarDay, int* lunarMonth, int* lunarYear, int* lunarLeap) {
        long dayNumber = jdFromDate(dd, mm, yy);
        int k = (int)floor((dayNumber - 2415021.076998695) / 29.530588853);
        long monthStart = getNewMoonDay(k + 1, timeZone);
        if (monthStart > dayNumber) {
            monthStart = getNewMoonDay(k, timeZone);
        }
        long a11 = getLunarMonth11(yy, timeZone);
        long b11 = a11;
        int lunarYearVal;
        if (a11 >= monthStart) {
            lunarYearVal = yy;
            a11 = getLunarMonth11(yy - 1, timeZone);
        } else {
            lunarYearVal = yy + 1;
            b11 = getLunarMonth11(yy + 1, timeZone);
        }
        int lunarDayVal = dayNumber - monthStart + 1;
        long diff = (monthStart - a11) / 29;
        int lunarLeapVal = 0;
        int lunarMonthVal = diff + 11;
        if (b11 - a11 > 365) {
            int leapMonthDiff = getLeapMonthOffset(a11, timeZone);
            if (diff >= leapMonthDiff) {
                lunarMonthVal = diff + 10;
                if (diff == leapMonthDiff) {
                    lunarLeapVal = 1;
                }
            }
        }
        if (lunarMonthVal > 12) {
            lunarMonthVal -= 12;
        }
        if (lunarMonthVal >= 11 && diff < 4) {
            lunarYearVal -= 1;
        }
        *lunarDay = lunarDayVal;
        *lunarMonth = lunarMonthVal;
        *lunarYear = lunarYearVal;
        *lunarLeap = lunarLeapVal;
    }
}

DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
LiquidCrystal_I2C lcd(LCD_I2C_ADDRESS, 16, 2);
Adafruit_SSD1306 oled(OLED_WIDTH, OLED_HEIGHT, &Wire, -1);

void drawAwakeFace() {
    oled.clearDisplay();
    oled.setTextSize(1);
    oled.setTextColor(SSD1306_WHITE);
    oled.setCursor(20, 2);
    oled.print("Motion detected");
    oled.fillCircle(40, 34, 10, SSD1306_WHITE);
    oled.fillCircle(88, 34, 10, SSD1306_WHITE);
    oled.drawLine(30, 54, 50, 60, SSD1306_WHITE);
    oled.drawLine(50, 60, 78, 60, SSD1306_WHITE);
    oled.drawLine(78, 60, 98, 54, SSD1306_WHITE);
    oled.display();
}

void drawSleepingFace() {
    oled.clearDisplay();
    oled.setTextSize(1);
    oled.setTextColor(SSD1306_WHITE);
    oled.setCursor(35, 2);
    oled.print("Idle");
    oled.drawLine(30, 34, 50, 34, SSD1306_WHITE);
    oled.drawLine(78, 34, 98, 34, SSD1306_WHITE);
    oled.drawLine(55, 56, 73, 56, SSD1306_WHITE);
    oled.setTextSize(2);
    oled.setCursor(100, 16);
    oled.print("z");
    oled.setTextSize(1);
    oled.setCursor(90, 30);
    oled.print("z");
    oled.display();
}

unsigned long lastPublish = 0;
int lastMotionState = -1;
int pendingMotionState = -1;
unsigned long pendingMotionSince = 0;

void renderOled() {
    if (lastMotionState == HIGH) {
        drawAwakeFace();
    } else {
        drawSleepingFace();
    }
}

bool relayOn = false;
unsigned long relayOffAt = 0;

float lastTemperature = NAN;
float lastHumidity = NAN;

enum LcdPage { PAGE_DATETIME, PAGE_SENSOR };
LcdPage lcdPage = PAGE_DATETIME;
unsigned long lastLcdSwitch = 0;
unsigned long lastClockTick = 0;
// Motion is event-driven, not part of the page rotation: it just overlays
// both rows for MOTION_ALERT_MS whenever the state changes, then the normal
// rotation resumes exactly where it left off.
unsigned long motionAlertUntil = 0;
const unsigned long MOTION_ALERT_MS = 3000;
// Suppress motion alerts for this long after boot — the PIR's power-up
// false trigger otherwise fires a real Telegram/Alexa/screen alert every
// single time the board resets. Measured from when loop() actually starts,
// not raw millis() since power-on: connectWifi() blocks in setup() for
// several seconds, which would otherwise already eat into this window before
// the PIR is ever even checked.
const unsigned long PIR_WARMUP_MS = 5000;
unsigned long loopStartMillis = 0;

// Writes a full 16-char line (padded with spaces) so leftover characters from
// a previous, longer string never linger — lets each line update on its own
// without a full lcd.clear(), which would make the *other* line flicker too.
void lcdPrintLine(int row, const String& text) {
    String padded = text;
    while (padded.length() < 16) {
        padded += ' ';
    }
    lcd.setCursor(0, row);
    lcd.print(padded.substring(0, 16));
}

enum DateSubPage { DATE_SOLAR, DATE_LUNAR };
DateSubPage dateSubPage = DATE_SOLAR;
unsigned long lastDateSubSwitch = 0;
const unsigned long DATE_SUB_INTERVAL_MS = 4000;

void renderDateTimePage() {
    time_t now = time(nullptr);
    if (now < 8 * 3600 * 2) {
        // Not synced yet (time() starts near epoch until NTP responds).
        lcdPrintLine(0, "Syncing time...");
        lcdPrintLine(1, "");
        return;
    }
    struct tm timeinfo;
    localtime_r(&now, &timeinfo);

    if (millis() - lastDateSubSwitch >= DATE_SUB_INTERVAL_MS) {
        lastDateSubSwitch = millis();
        dateSubPage = (dateSubPage == DATE_SOLAR) ? DATE_LUNAR : DATE_SOLAR;
    }

    if (dateSubPage == DATE_SOLAR) {
        char dateBuf[11];
        strftime(dateBuf, sizeof(dateBuf), "%d/%m/%Y", &timeinfo);
        lcdPrintLine(0, String(dateBuf) + " DL");
    } else {
        // The lunar astronomical calculation (several sin()/floor() calls, one
        // with up to 14 iterations) only needs to run once per calendar day —
        // cache it and only recompute when the solar date actually changes.
        static int cachedDay = -1, cachedMonth = -1, cachedYear = -1;
        static int lunarDay = 0, lunarMonth = 0, lunarYear = 0, lunarLeap = 0;
        if (timeinfo.tm_mday != cachedDay || timeinfo.tm_mon != cachedMonth || timeinfo.tm_year != cachedYear) {
            VnLunar::convertSolar2Lunar(timeinfo.tm_mday, timeinfo.tm_mon + 1, timeinfo.tm_year + 1900,
                                         NTP_TIMEZONE_OFFSET_SEC / 3600, &lunarDay, &lunarMonth, &lunarYear, &lunarLeap);
            cachedDay = timeinfo.tm_mday;
            cachedMonth = timeinfo.tm_mon;
            cachedYear = timeinfo.tm_year;
        }
        char lunarBuf[16];
        snprintf(lunarBuf, sizeof(lunarBuf), "%02d/%02d/%04d", lunarDay, lunarMonth, lunarYear);
        lcdPrintLine(0, String(lunarBuf) + " AL");
    }

    char timeBuf[9];
    strftime(timeBuf, sizeof(timeBuf), "%H:%M:%S", &timeinfo);
    lcdPrintLine(1, timeBuf);
}

void renderSensorPage() {
    String temp = isnan(lastTemperature) ? "--.-C" : String(lastTemperature, 1) + "C";
    String hum = isnan(lastHumidity) ? "--.-%" : String(lastHumidity, 1) + "%";
    lcdPrintLine(0, "Temp: " + temp);
    lcdPrintLine(1, "Hum:  " + hum);
}

void renderMotionAlert() {
    lcdPrintLine(0, "Motion");
    lcdPrintLine(1, lastMotionState == HIGH ? "DETECTED" : "CLEARED");
}

// Single entry point for anything that wants the LCD redrawn — always
// re-checks precedence (motion alert overrides whichever page is current)
// instead of each call site guessing what should currently be on screen.
void renderLcd() {
    if (millis() < motionAlertUntil) {
        renderMotionAlert();
    } else if (lcdPage == PAGE_DATETIME) {
        renderDateTimePage();
    } else {
        renderSensorPage();
    }
}

void setRelay(bool on) {
    relayOn = on;
    digitalWrite(RELAY_PIN, on != RELAY_ACTIVE_LOW ? HIGH : LOW);
}

String urlEncode(const String& text) {
    String encoded;
    char buf[4];
    for (size_t i = 0; i < text.length(); i++) {
        char c = text[i];
        if (isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
            encoded += c;
        } else {
            snprintf(buf, sizeof(buf), "%%%02X", (unsigned char)c);
            encoded += buf;
        }
    }
    return encoded;
}

void sendTelegramMessage(const String& text) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient https;
    String url = "https://api.telegram.org/bot" + String(TELEGRAM_BOT_TOKEN) +
                 "/sendMessage?chat_id=" + String(TELEGRAM_CHAT_ID) +
                 "&text=" + urlEncode(text);
    if (https.begin(client, url)) {
        int httpCode = https.GET();
        Serial.printf("Telegram send: HTTP %d\n", httpCode);
        https.end();
    } else {
        Serial.println("Telegram HTTPS begin failed");
    }
}

void connectWifi() {
    if (WiFi.status() == WL_CONNECTED) {
        return;
    }
    WiFi.mode(WIFI_STA);
#if USE_STATIC_IP
    IPAddress ip(STATIC_IP);
    IPAddress gateway(STATIC_GATEWAY);
    IPAddress subnet(STATIC_SUBNET);
    IPAddress dns(STATIC_DNS);
    if (!WiFi.config(ip, gateway, subnet, dns)) {
        Serial.println("Static IP configuration failed, falling back to DHCP");
    }
#endif
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.printf("Connecting to WiFi \"%s\"", WIFI_SSID);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    Serial.printf("WiFi connected, IP: %s\n", WiFi.localIP().toString().c_str());
}

void connectMqtt() {
    while (!mqttClient.connected()) {
        Serial.printf("Connecting to MQTT broker %s:%d...\n", MQTT_BROKER_HOST, MQTT_BROKER_PORT);
        bool connected;
        if (strlen(MQTT_USERNAME) > 0) {
            connected = mqttClient.connect(MQTT_CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD);
        } else {
            connected = mqttClient.connect(MQTT_CLIENT_ID);
        }
        if (connected) {
            Serial.println("MQTT connected");
        } else {
            Serial.printf("MQTT connect failed, rc=%d, retrying in 2s\n", mqttClient.state());
            delay(2000);
        }
    }
}

void setup() {
    Serial.begin(115200);
    dht.begin();
    pinMode(PIR_PIN, INPUT);
    pinMode(RELAY_PIN, OUTPUT);
    setRelay(false);
    Wire.begin(LCD_SDA_PIN, LCD_SCL_PIN);
    Wire.setClock(100000);
    delay(100);
    lcd.init();
    delay(50);
    lcd.backlight();
    delay(50);
    lcd.clear();
    if (!oled.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDRESS)) {
        Serial.println("OLED init failed");
    } else {
        renderOled();
    }
    connectWifi();
    configTime(NTP_TIMEZONE_OFFSET_SEC, 0, NTP_SERVER);
    mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
    renderLcd();
    loopStartMillis = millis();
}

void loop() {
    connectWifi();
    connectMqtt();
    mqttClient.loop();

    int rawMotionState = digitalRead(PIR_PIN);
    if (rawMotionState != pendingMotionState) {
        pendingMotionState = rawMotionState;
        pendingMotionSince = millis();
    } else if (pendingMotionState != lastMotionState &&
               millis() - pendingMotionSince >= MOTION_DEBOUNCE_MS) {
        lastMotionState = pendingMotionState;
        if (millis() - loopStartMillis < PIR_WARMUP_MS) {
            // PIR output is unstable right after power-up (datasheet-documented
            // ~30-60s settling behavior; in practice the false trigger usually
            // lands within the first few seconds) — sync state silently, no
            // alert, so a boot-time glitch doesn't page Telegram/Alexa/screens.
            Serial.printf("Motion %s (warmup, suppressed)\n", lastMotionState == HIGH ? "detected" : "cleared");
            renderLcd();
            renderOled();
        } else {
            mqttClient.publish(MQTT_TOPIC_MOTION, lastMotionState == HIGH ? "1" : "0");
            Serial.printf("Motion %s\n", lastMotionState == HIGH ? "detected" : "cleared");
            sendTelegramMessage(lastMotionState == HIGH ? "🚨 Motion detected" : "✅ Motion cleared");
            motionAlertUntil = millis() + MOTION_ALERT_MS;
            renderLcd();
            renderOled();
        }
    }

    if (millis() - lastClockTick >= 1000) {
        lastClockTick = millis();
        renderLcd();
    }

    unsigned long currentPageDuration = (lcdPage == PAGE_DATETIME) ? LCD_DATETIME_DURATION_MS : LCD_SENSOR_DURATION_MS;
    if (millis() - lastLcdSwitch >= currentPageDuration) {
        lastLcdSwitch = millis();
        lcdPage = (lcdPage == PAGE_DATETIME) ? PAGE_SENSOR : PAGE_DATETIME;
        renderLcd();
    }

    // Follow the debounced PIR state directly: keep the relay on (and keep
    // refreshing the hold timer) for as long as PIR reads HIGH, however long
    // that is. This way a PIR stuck HIGH for a long time (big Tx pot setting,
    // or just continued presence) still drives the relay correctly instead of
    // only reacting to LOW->HIGH edges.
    if (lastMotionState == HIGH) {
        relayOffAt = millis() + RELAY_HOLD_MS;
        if (!relayOn) {
            setRelay(true);
            Serial.println("Relay ON");
        }
    }

    if (relayOn && millis() >= relayOffAt) {
        setRelay(false);
        Serial.println("Relay OFF");
    }

    unsigned long now = millis();
    if (now - lastPublish >= PUBLISH_INTERVAL_MS) {
        lastPublish = now;

        float humidity = dht.readHumidity();
        float temperature = dht.readTemperature();

        if (isnan(humidity) || isnan(temperature)) {
            Serial.println("Failed to read from DHT22 sensor");
        } else {
            lastTemperature = temperature;
            lastHumidity = humidity;

            char payload[16];

            snprintf(payload, sizeof(payload), "%.1f", temperature);
            mqttClient.publish(MQTT_TOPIC_TEMPERATURE, payload);

            snprintf(payload, sizeof(payload), "%.1f", humidity);
            mqttClient.publish(MQTT_TOPIC_HUMIDITY, payload);

            Serial.printf("Published temp=%.1fC humidity=%.1f%%\n", temperature, humidity);

            if (lcdPage == PAGE_SENSOR) {
                renderLcd();
            }
        }
    }
}
