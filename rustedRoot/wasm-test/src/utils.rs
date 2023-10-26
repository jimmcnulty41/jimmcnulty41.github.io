pub mod bindings {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(js_namespace = console)]
        pub fn log(s: &str);
    }

    #[wasm_bindgen(start)]
    pub fn run() {}
}

pub mod utils {
    pub fn set_panic_hook() {
        // When the `console_error_panic_hook` feature is enabled, we can call the
        // `set_panic_hook` function at least once during initialization, and then
        // we will get better error messages if our code ever panics.
        //
        // For more details see
        // https://github.com/rustwasm/console_error_panic_hook#readme
        #[cfg(feature = "console_error_panic_hook")]
        console_error_panic_hook::set_once();
    }
}

pub mod macros {
    #[macro_export]
    macro_rules! console_log {
        ($($t:tt)*) => (crate::utils::bindings::log(&format_args!($($t)*).to_string()))
    }
}
