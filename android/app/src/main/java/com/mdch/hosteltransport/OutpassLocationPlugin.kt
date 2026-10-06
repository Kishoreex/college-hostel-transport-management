package com.mdch.hosteltransport

import android.content.Intent
import android.provider.Settings
import android.net.Uri

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.PluginMethod

@CapacitorPlugin(name = "OutpassLocation")
class OutpassLocationPlugin : Plugin() {

    // =========================================================
    // OPEN MADHA CAMPUS APP SETTINGS
    // =========================================================

    @PluginMethod
    fun openAppSettings(call: PluginCall) {

        try {

            val intent =
                Intent(
                    Settings.ACTION_APPLICATION_DETAILS_SETTINGS
                )

            intent.data =
                Uri.parse(
                    "package:" + context.packageName
                )

            intent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
            )

            context.startActivity(intent)

            call.resolve()

        } catch (e: Exception) {

            call.reject(
                "Unable to open app settings",
                e
            )
        }
    }
}