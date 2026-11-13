package vn.clinic;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;

public class StaticServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getServletPath();
        String name = switch (path) {
            case "/", "/index.html" -> "index.html";
            case "/style.css" -> "style.css";
            case "/app.js" -> "app.js";
            default -> null;
        };
        if (name == null) { resp.sendError(404); return; }
        String mime = name.endsWith(".css") ? "text/css" : name.endsWith(".js") ? "application/javascript" : "text/html";
        resp.setContentType(mime + "; charset=UTF-8");
        resp.setHeader("Cache-Control", "no-store");
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("web/" + name)) {
            if (in == null) { resp.sendError(404); return; }
            in.transferTo(resp.getOutputStream());
        }
    }
}
