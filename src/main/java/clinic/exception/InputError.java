package clinic.exception;

public class InputError extends RuntimeException {
    public InputError(String message) {
        super(message);
    }
}
