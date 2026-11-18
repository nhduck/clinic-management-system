package clinic;

import clinic.services.taikhoan.ApiTaiKhoan;
import clinic.services.taikhoan.LocDangNhap;
import clinic.services.taikhoan.ApiDangNhap;
import clinic.services.lichkham.api.ApiLichKham;
import clinic.services.lichkham.api.ApiGioTrong;
import clinic.services.dulieu.api.ApiDuLieu;
import clinic.services.thuoc.api.ApiThuoc;
import clinic.services.donthuoc.api.ApiDonThuoc;
import clinic.services.benhan.api.ApiBenhAn;
import clinic.shared.config.CoSoDuLieu;
import clinic.shared.servlet.ApiKhongCo;

import jakarta.servlet.http.HttpServlet;

import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;
import org.apache.tomcat.util.descriptor.web.FilterDef;
import org.apache.tomcat.util.descriptor.web.FilterMap;

// Khởi động máy chủ và đăng ký các API
public class MayChu {
    public static void main(String[] thamSo) throws Exception {
        int cong = Integer.parseInt(
                System.getenv().getOrDefault("PORT", "8080")
        );

        String thuMucTam = System.getProperty("java.io.tmpdir");

        String thuMucGoc = System.getenv().getOrDefault(
                "TOMCAT_BASE_DIR",
                thuMucTam + "/clinic-tomcat"
        );

        CoSoDuLieu.initialize();

        Tomcat tomcat = new Tomcat();
        tomcat.setBaseDir(thuMucGoc);
        tomcat.setPort(cong);
        tomcat.getConnector();

        Context nguCanh = tomcat.addContext("", thuMucTam);
        nguCanh.setUseHttpOnly(true);

        register(nguCanh, new ApiDangNhap(), "/api/auth/*");
        register(nguCanh, new ApiTaiKhoan(), "/api/accounts", "/api/accounts/*");
        register(nguCanh, new ApiDuLieu(), "/api/data");
        register(nguCanh, new ApiGioTrong(), "/api/slots");
        register(nguCanh, new ApiBenhAn(), "/api/records");
        register(nguCanh, new ApiDonThuoc(), "/api/prescriptions");
        register(nguCanh, new ApiThuoc(), "/api/drugs", "/api/drugs/*");
        register(nguCanh, new ApiLichKham(), "/api/appointments", "/api/appointments/*");
        register(nguCanh, new ApiKhongCo(), "/api/*");

        FilterDef boLoc = new FilterDef();
        boLoc.setFilterName("AuthFilter");
        boLoc.setFilter(new LocDangNhap());
        nguCanh.addFilterDef(boLoc);

        FilterMap anhXa = new FilterMap();
        anhXa.setFilterName("AuthFilter");
        anhXa.addURLPattern("/api/*");
        nguCanh.addFilterMap(anhXa);

        tomcat.start();

        System.out.println("Server dang chay tren cong " + cong);

        tomcat.getServer().await();
    }

    private static void register(
            Context nguCanh,
            HttpServlet boXuLy,
            String... cacDuongDan
    ) {
        String ten = boXuLy.getClass().getSimpleName();

        Tomcat.addServlet(nguCanh, ten, boXuLy);

        for (String duongDan : cacDuongDan) {
            nguCanh.addServletMappingDecoded(duongDan, ten);
        }
    }
}
