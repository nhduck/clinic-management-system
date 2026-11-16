package clinic;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/** Docker health check: requires successful HTTP and reachable database. */
public class HealthCheck {
    public static void main(String[] args) throws Exception {
        var client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
        var request =
                HttpRequest.newBuilder(URI.create("http://127.0.0.1:8080/api/health"))
                        .timeout(Duration.ofSeconds(4))
                        .GET()
                        .build();
        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200 || !response.body().contains("\"connected\"")) {
            System.exit(1);
        }
    }
}
