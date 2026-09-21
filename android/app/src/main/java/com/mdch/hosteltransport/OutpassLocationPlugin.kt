package com.mdch.hosteltransport

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.provider.Settings
import android.net.Uri

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.JSObject
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.PluginMethod

@CapacitorPlugin(name = "OutpassLocation")
class OutpassLocationPlugin : Plugin() {

    private var locationReceiver: BroadcastReceiver? = null

    override fun load() {
        super.load()

        locationReceiver = object : BroadcastReceiver() {

            override fun onReceive(
                context: Context?,
                intent: Intent?
            ) {

                if (
                    intent?.action ==
                    "com.mdch.hosteltransport.LOCATION_UPDATE"
                ) {

                    val latitude =
                        intent.getDoubleExtra(
                            "latitude",
                            0.0
                        )

                    val longitude =
                        intent.getDoubleExtra(
                            "longitude",
                            0.0
                        )

                    val data = JSObject()

                    data.put(
                        "latitude",
                        latitude
                    )

                    data.put(
                        "longitude",
                        longitude
                    )

                    notifyListeners(
                        "locationUpdate",
                        data
                    )
                }
            }
        }

        val filter =
            IntentFilter(
                "com.mdch.hosteltransport.LOCATION_UPDATE"
            )

        if (android.os.Build.VERSION.SDK_INT >= 33) {

            context.registerReceiver(
                locationReceiver,
                filter,
                Context.RECEIVER_NOT_EXPORTED
            )

        } else {

            @Suppress("DEPRECATION")
            context.registerReceiver(
                locationReceiver,
                filter
            )
        }
    }

    // =========================================================
    // START BACKGROUND LOCATION
    // =========================================================

    @PluginMethod
    fun start(call: PluginCall) {

        val intent =
            Intent(
                context,
                OutpassLocationService::class.java
            )

        intent.action =
            OutpassLocationService.ACTION_START

        androidx.core.content.ContextCompat
            .startForegroundService(
                context,
                intent
            )

        call.resolve()
    }

    // =========================================================
    // STOP BACKGROUND LOCATION
    // =========================================================

    @PluginMethod
    fun stop(call: PluginCall) {

        val intent =
            Intent(
                context,
                OutpassLocationService::class.java
            )

        intent.action =
            OutpassLocationService.ACTION_STOP

        context.startService(intent)

        call.resolve()
    }

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

    // =========================================================
    // DESTROY
    // =========================================================

    override fun handleOnDestroy() {

        locationReceiver?.let {

            try {
                context.unregisterReceiver(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        locationReceiver = null

        super.handleOnDestroy()
    }
}