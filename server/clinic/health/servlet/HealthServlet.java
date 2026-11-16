package clinic.health.servlet;

import clinic.health.service.HealthService;
import clinic.shared.servlet.BaseApiServlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/** HTTP adapter for the health service. */
public class HealthServlet extends BaseApiServlet {
    private final HealthService health = new HealthService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(req, resp, () -> send(resp, 200, health.status()));
    }
}
