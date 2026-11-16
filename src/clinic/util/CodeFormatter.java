package clinic.util;

public class CodeFormatter {
    public static String patientCode(int id) {
        return String.format("BN%03d", id);
    }

    public static String recordCode(int id) {
        return String.format("BA%03d", id);
    }

    public static String prescriptionCode(int id) {
        return String.format("DT%03d", id);
    }

    public static String doctorCode(int id) {
        return String.format("BS%03d", id);
    }

    public static String appointmentCode(int id) {
        return String.format("LK%03d", id);
    }
}
