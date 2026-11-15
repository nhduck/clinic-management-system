package clinic;

import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;

import clinic.config.Database;
import clinic.servlet.*;

public class WebServer {
    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        Database.initialize();
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(port);
        tomcat.getConnector();
        Context ctx = tomcat.addContext("", System.getProperty("java.io.tmpdir"));
        Tomcat.addServlet(ctx, "DataServlet", new DataServlet());
        ctx.addServletMappingDecoded("/api/data", "DataServlet");
        Tomcat.addServlet(ctx, "HealthServlet", new HealthServlet());
        ctx.addServletMappingDecoded("/api/health", "HealthServlet");
        Tomcat.addServlet(ctx, "SlotServlet", new SlotServlet());
        ctx.addServletMappingDecoded("/api/slots", "SlotServlet");
        Tomcat.addServlet(ctx, "MedicalRecordServlet", new MedicalRecordServlet());
        ctx.addServletMappingDecoded("/api/records", "MedicalRecordServlet");
        Tomcat.addServlet(ctx, "PrescriptionServlet", new PrescriptionServlet());
        ctx.addServletMappingDecoded("/api/prescriptions", "PrescriptionServlet");
        Tomcat.addServlet(ctx, "DrugServlet", new DrugServlet());
        ctx.addServletMappingDecoded("/api/drugs", "DrugServlet");
        ctx.addServletMappingDecoded("/api/drugs/*", "DrugServlet");
        Tomcat.addServlet(ctx, "AppointmentServlet", new AppointmentServlet());
        ctx.addServletMappingDecoded("/api/appointments", "AppointmentServlet");
        ctx.addServletMappingDecoded("/api/appointments/*", "AppointmentServlet");
        Tomcat.addServlet(ctx, "NotFoundServlet", new NotFoundServlet());
        ctx.addServletMappingDecoded("/api/*", "NotFoundServlet");
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
