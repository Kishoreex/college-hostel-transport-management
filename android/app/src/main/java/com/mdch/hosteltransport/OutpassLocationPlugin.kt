package com.mdch.hosteltransport

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.JSObject
import com.getcapacitor.annotation.CapacitorPlugin

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