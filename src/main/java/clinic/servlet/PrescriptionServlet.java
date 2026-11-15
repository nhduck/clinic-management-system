package clinic.servlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import clinic.service.PrescriptionService;

import java.io.IOException;

public class PrescriptionServlet extends BaseApiServlet {
    private final PrescriptionService prescriptions = new PrescriptionService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(req, resp, () -> send(resp, 201, prescriptions.create(readBody(req))));
    }
}
