package clinic.servlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import clinic.service.DataService;

import java.io.IOException;

public class DataServlet extends BaseApiServlet {
    private final DataService data = new DataService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(req, resp, () -> send(resp, 200, data.load()));
    }
}
