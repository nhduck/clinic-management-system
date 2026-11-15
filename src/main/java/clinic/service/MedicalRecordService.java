package clinic.service;

import static clinic.util.JsonInput.*;

import com.google.gson.*;

import clinic.dao.MedicalRecordDAO;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;

public class MedicalRecordService {
    private final MedicalRecordDAO records = new MedicalRecordDAO();

    public Map<String, String> create(JsonObject body) throws SQLException {

        int patientId = parseCode(required(body, "pid", 20), "BN", "Mã bệnh nhân không hợp lệ");
        LocalDate date = date(required(body, "date", 10));
        String symptoms = required(body, "sym", 5000);
        String diagnosis = required(body, "dx", 5000);
        String note = optional(body, "note", 5000);

        return records.create(patientId, date, symptoms, diagnosis, note);
    }
}
