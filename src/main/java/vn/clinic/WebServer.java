package vn.clinic;

import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;

public class WebServer {
    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        Database.initialize();
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(port);
        tomcat.getConnector();
        Context ctx = tomcat.addContext("", System.getProperty("java.io.tmpdir"));
        Tomcat.addServlet(ctx, "api", new ApiServlet());
        ctx.addServletMappingDecoded("/api/*", "api");
        Tomcat.addServlet(ctx, "static", new StaticServlet());
        ctx.addServletMappingDecoded("/", "static");
        tomcat.start();
        System.out.println("==============================================");
        System.out.println("PHONG KHAM: http://localhost:" + port);
        System.out.println("Nhan Ctrl+C de dung server.");
        System.out.println("==============================================");
        tomcat.getServer().await();
    }
}
