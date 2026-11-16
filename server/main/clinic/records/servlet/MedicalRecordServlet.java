package clinic.records.servlet;

import clinic.records.service.MedicalRecordService;
import clinic.shared.servlet.BaseApiServlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class MedicalRecordServlet extends BaseApiServlet {
    private final MedicalRecordService records = new MedicalRecordService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(req, resp, () -> send(resp, 201, records.create(readBody(req))));
    }
}
