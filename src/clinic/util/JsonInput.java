package clinic.util;

import com.google.gson.JsonObject;

import clinic.exception.InputError;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;

public class JsonInput {
    public static String required(JsonObject x, String key, int maxLength) {
        String value = optional(x, key, maxLength);
        if (value.isBlank()) throw new InputError("Thiếu trường bắt buộc: " + key);
        return value;
    }

    public static String optional(JsonObject x, String key, int maxLength) {
        String value =
                !x.has(key) || x.get(key).isJsonNull() ? "" : x.get(key).getAsString().trim();
        if (value.length() > maxLength) throw new InputError("Trường " + key + " quá dài");
        return value;
    }

    public static int intField(JsonObject x, String key) {
        try {
            return Integer.parseInt(required(x, key, 12));
        } catch (NumberFormatException ex) {
            throw new InputError("Trường " + key + " phải là số");
        }
    }

    public static LocalTime timeField(JsonObject x, String key) {
        try {
            return LocalTime.parse(required(x, key, 5));
        } catch (DateTimeParseException ex) {
            throw new InputError("Giờ khám không hợp lệ (định dạng HH:mm)");
        }
    }

    public static LocalDate date(String raw) {
        try {
            return LocalDate.parse(raw);
        } catch (DateTimeParseException ex) {
            throw new InputError("Ngày khám không hợp lệ (YYYY-MM-DD)");
        }
    }

    public static int parseCode(String code, String prefix, String message) {
        if (!code.matches(prefix + "[0-9]{1,9}")) throw new InputError(message);
        return Integer.parseInt(code.substring(prefix.length()));
    }

    public static String nz(String v) {
        return v == null ? "" : v;
    }
}
