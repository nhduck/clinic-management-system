package clinic.services.appointments.servlet;

import clinic.services.appointments.service.AppointmentApiService;
import clinic.shared.servlet.BaseApiServlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class AppointmentServlet extends BaseApiServlet {
    private final AppointmentApiService appointments = new AppointmentApiService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(
                req,
                resp,
                () -> {
                    String path = req.getPathInfo();
                    if (path == null) {
                        send(resp, 201, appointments.createAppointment(readBody(req)));
                    } else if (path.matches("/LK[0-9]{1,9}/cancel")) {
                        readBody(req);
                        send(resp, 200, appointments.cancelAppointment(path.split("/")[1]));
                    } else {
                        notFound(resp);
                    }
                });
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(
                req,
                resp,
                () -> {
                    String path = req.getPathInfo();
                    if (path != null && path.matches("/LK[0-9]{1,9}")) {
                        send(
                                resp,
                                200,
                                appointments.updateAppointment(path.substring(1), readBody(req)));
                    } else {
                        notFound(resp);
                    }
                });
    }
}
