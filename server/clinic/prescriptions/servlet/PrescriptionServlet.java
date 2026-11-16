package clinic.prescriptions.servlet;

import clinic.prescriptions.service.PrescriptionService;
import clinic.shared.servlet.BaseApiServlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class PrescriptionServlet extends BaseApiServlet {
    private final PrescriptionService prescriptions = new PrescriptionService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(req, resp, () -> send(resp, 201, prescriptions.create(readBody(req))));
    }
}
