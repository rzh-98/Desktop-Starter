#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    use tauri::Manager;

    let check_renderer = std::env::args().any(|arg| arg == "--check-renderer");
    tauri::Builder::default()
        .setup(move |app| {
            if check_renderer {
                let window = app.get_webview_window("main").expect("missing main window");
                std::thread::spawn(move || {
                    for _ in 0..30 {
                        std::thread::sleep(std::time::Duration::from_secs(1));
                        let handle = window.app_handle().clone();
                        let _ = window.eval_with_callback(
                            "Boolean(window.desktop && document.querySelector('#root > *'))",
                            move |mounted| {
                                if mounted == "true" {
                                    handle.exit(0);
                                }
                            },
                        );
                    }
                    window.app_handle().exit(1);
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run Desktop Starter");
}
