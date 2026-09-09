package com.dora

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import java.io.File

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
      jsBundleFilePath = resolveOtaBundlePath(),
    )
  }

  /**
   * Points the app at a silently-downloaded OTA JS bundle (see
   * src/services/otaUpdate.ts) when one is present and the previous launch
   * confirmed it booted cleanly. If the last launch never confirmed --
   * because it crashed -- the bad bundle is discarded so this launch falls
   * back to the bundle shipped in the APK instead of crash-looping.
   */
  private fun resolveOtaBundlePath(): String? {
    val otaDir = File(filesDir, "ota")
    val bundle = File(otaDir, "index.android.bundle")
    val bootPending = File(otaDir, "boot_pending")

    if (bootPending.exists()) {
      bundle.delete()
      bootPending.delete()
      return null
    }
    if (!bundle.exists()) return null

    bootPending.createNewFile()
    return bundle.absolutePath
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
