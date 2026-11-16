package clinic.shared.util;

import java.io.FileDescriptor;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;

public final class ConsoleUtil {
    private ConsoleUtil() {}

    public static void setupUtf8() {
        if (System.getProperty("os.name", "").toLowerCase().contains("win")) {
            try {
                // Tiến trình con dùng chung console với chương trình nên đổi được bảng mã của nó.
                new ProcessBuilder("cmd", "/c", "chcp 65001 >nul").inheritIO().start().waitFor();
            } catch (IOException e) {
                // Bỏ qua: người dùng có thể tự gõ "chcp 65001" trong terminal.
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        System.setOut(
                new PrintStream(
                        new FileOutputStream(FileDescriptor.out), true, StandardCharsets.UTF_8));
        System.setErr(
                new PrintStream(
                        new FileOutputStream(FileDescriptor.err), true, StandardCharsets.UTF_8));
    }
}
