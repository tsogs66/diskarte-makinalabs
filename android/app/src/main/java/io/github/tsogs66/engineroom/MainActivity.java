package io.github.tsogs66.engineroom;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /* Sizes the user sets on the pages are written straight to app storage, so closing or killing the app cannot lose them. */
    public static class Store {
        private final SharedPreferences prefs;

        Store(SharedPreferences prefs) {
            this.prefs = prefs;
        }

        @JavascriptInterface
        public String get(String key) {
            return prefs.getString(key, null);
        }

        @JavascriptInterface
        public void set(String key, String value) {
            prefs.edit().putString(key, value).commit();
        }
    }

    /* Added before the bridge loads the first page, so every page and frame has it. */
    @Override
    protected void load() {
        WebView web = findViewById(com.getcapacitor.android.R.id.webview);
        if (web != null) {
            web.addJavascriptInterface(new Store(getSharedPreferences("diskarte", Context.MODE_PRIVATE)), "DiskarteStore");
        }
        super.load();
    }

    /* Use the whole screen beside a notch; the pages keep clear of it with their safe-area padding. */
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams a = getWindow().getAttributes();
            a.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(a);
        }
    }

    /* Full screen: the mimic needs all the height it can get. A swipe from the edge brings the bars back for a moment. */
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            bars.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            bars.hide(WindowInsetsCompat.Type.systemBars());
        }
    }
}
