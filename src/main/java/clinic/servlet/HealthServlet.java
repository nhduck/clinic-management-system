package clinic.servlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import clinic.config.Database;

import java.io.IOException;
import java.sql.Connection;
import java.util.Map;

public class HealthServlet extends BaseApiServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(
                req,
                resp,
                () -> {
                    try (Connection connection = Database.connect()) {
                        send(
                                resp,
                                200,
                                Map.of(
                                        "status",
                                        "ok",
                                        "database",
                                        connection.isValid(3) ? "connected" : "unavailable"));
                    }
                });
    }
}
