package clinic.servlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import clinic.service.MedicalRecordService;

import java.io.IOException;

public class MedicalRecordServlet extends BaseApiServlet {
    private final MedicalRecordService records = new MedicalRecordService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(req, resp, () -> send(resp, 201, records.create(readBody(req))));
    }
}
