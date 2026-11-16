package clinic.servlet;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;

public class StaticServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getServletPath();
        String name = "/".equals(path) ? "index.html" : path.substring(1);
        if (name.isBlank() || name.contains("\\") || name.indexOf('\0') >= 0) {
            resp.sendError(404);
            return;
        }
        Path normalized = Path.of(name).normalize();
        if (normalized.isAbsolute()
                || normalized.startsWith("..")
                || !normalized.toString().replace('\\', '/').equals(name)) {
            resp.sendError(404);
            return;
        }
        String mime;
        if (name.endsWith(".js")) mime = "application/javascript";
        else if (name.endsWith(".css")) mime = "text/css";
        else if (name.endsWith(".html")) mime = "text/html";
        else {
            resp.sendError(404);
            return;
        }
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("web/" + name)) {
            if (input == null) {
                resp.sendError(404);
                return;
            }
            resp.setContentType(mime + "; charset=UTF-8");
            resp.setHeader("Cache-Control", "no-store");
            input.transferTo(resp.getOutputStream());
        }
    }
}
