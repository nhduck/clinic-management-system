package clinic.service;

import clinic.dao.*;
import clinic.exception.NghiepVuException;

import java.sql.SQLException;
import java.util.*;

public class DataService {
    private final PatientDAO patients = new PatientDAO();
    private final MedicalRecordDAO records = new MedicalRecordDAO();
    private final PrescriptionDAO prescriptions = new PrescriptionDAO();
    private final DrugDAO drugs = new DrugDAO();

    public Map<String, Object> load() throws SQLException, NghiepVuException {
        List<Map<String, Object>> drugItems = drugs.findAll();
        List<String> drugNames = drugItems.stream().map(item -> (String) item.get("name")).toList();
        return Map.of(
                "pts",
                patients.findAll(),
                "drugs",
                drugNames,
                "drugItems",
                drugItems,
                "recs",
                records.findAll(),
                "rx",
                prescriptions.findAll(),
                "shifts",
                AppointmentApiService.shiftList(),
                "appts",
                AppointmentApiService.appointmentList());
    }
}
