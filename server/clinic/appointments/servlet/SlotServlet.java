package clinic.appointments.servlet;

import clinic.appointments.service.AppointmentApiService;
import clinic.shared.servlet.BaseApiServlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class SlotServlet extends BaseApiServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(
                req,
                resp,
                () -> send(resp, 200, AppointmentApiService.slots(req.getParameter("shift"))));
    }
}
