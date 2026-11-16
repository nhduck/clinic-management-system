package clinic.services.drugs.service;

import static clinic.shared.util.JsonInput.*;

import clinic.services.drugs.dao.DrugDAO;

import com.google.gson.*;

import java.sql.SQLException;
import java.util.*;

public class DrugService {
    private final DrugDAO drugs = new DrugDAO();

    public Map<String, Object> create(JsonObject body) throws SQLException {
        return drugs.create(required(body, "name", 100));
    }

    public Map<String, Object> update(int id, JsonObject body) throws SQLException {
        return drugs.update(id, required(body, "name", 100));
    }

    public void delete(int id) throws SQLException {
        drugs.delete(id);
    }
}
