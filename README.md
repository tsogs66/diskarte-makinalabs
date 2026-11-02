# Diskarte by MakinaLabs

Marine engineer simulators for Android (landscape) and Windows, from one code base. Project notes live in the vault capsule: `project-mind/vault/projects/upaw`.

## Layout

- `src/home`: 3D dashboard (three.js). Add a program in `programs.js`.
- `src/purifier`: purifier source. `build.js` writes `vault/projects/upaw/purifier-simulator.html`.
- `vault/projects/upaw/fwg-simulator.html`: FWG source, edited directly.
- `src/shared`: workspace (tabs and pop-ups), theme, header, Info pages, logo.
- `scripts/build-web.js`: fills `www/`, which both apps use.
- `electron`: Windows app.

## Run and release

1. `npm run desktop` runs the Windows app.
2. Windows: `npm run dist:win` writes `release/Diskarte-<version>-x64.exe`.
3. Android: raise `versionCode` and `versionName` in `android/app/build.gradle`, run `npm run sync`, then in `android/` run `gradlew assembleRelease bundleRelease` with `JAVA_HOME` set to Android Studio's `jbr` and `ANDROID_HOME` set to the SDK.

AVG Web Shield inspects secure downloads on this PC. `signing/build-truststore.jks` is Java's `cacerts` with the AVG root added: point Gradle at it with `-Djavax.net.ssl.trustStore=<path>` and `-Djavax.net.ssl.trustStorePassword=changeit` in `JAVA_OPTS`, `GRADLE_OPTS` and `org.gradle.jvmargs`. For electron-builder set `NODE_EXTRA_CA_CERTS` to `signing/avg-root.pem`.

Keep the `signing/` folder safe. Android updates need the same key.
