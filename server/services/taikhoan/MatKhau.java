package clinic.services.taikhoan;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

// Tạo và kiểm tra mã băm mật khẩu
public class MatKhau {
    public static String bam(String matKhau) {
        byte[] muoi = new byte[16];
        new SecureRandom().nextBytes(muoi);

        return "pbkdf2$600000$"
                + Base64.getEncoder().encodeToString(muoi)
                + "$"
                + Base64.getEncoder().encodeToString(taoKhoa(matKhau, muoi));
    }

    public static boolean khop(String matKhau, String daLuu) {
        if (daLuu.startsWith("pbkdf2$600000$")) {
            String[] cacPhan = daLuu.split("\\$");

            byte[] muoi = Base64.getDecoder().decode(cacPhan[2]);
            byte[] mongDoi = Base64.getDecoder().decode(cacPhan[3]);

            return MessageDigest.isEqual(
                    taoKhoa(matKhau, muoi),
                    mongDoi
            );
        }

        try {
            byte[] thucTe = MessageDigest.getInstance("SHA-256")
                    .digest(matKhau.getBytes(StandardCharsets.UTF_8));

            return MessageDigest.isEqual(
                    thucTe,
                    HexFormat.of().parseHex(daLuu)
            );
        } catch (Exception loi) {
            return false;
        }
    }

    private static byte[] taoKhoa(String matKhau, byte[] muoi) {
        PBEKeySpec cauHinh = new PBEKeySpec(
                matKhau.toCharArray(),
                muoi,
                600000,
                256
        );

        try {
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                    .generateSecret(cauHinh)
                    .getEncoded();
        } catch (Exception loi) {
            throw new IllegalStateException(
                    "Không xử lý được mật khẩu",
                    loi
            );
        } finally {
            cauHinh.clearPassword();
        }
    }
}
