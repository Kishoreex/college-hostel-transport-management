package com.mdch.hosteltransport

import android.content.Intent
import androidx.core.content.ContextCompat
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "OutpassLocation")
class OutpassLocationPlugin : Plugin() {

    fun start(call: PluginCall) {

        val intent = Intent(
            context,
            OutpassLocationService::class.java
        )

        intent.action =
            OutpassLocationService.ACTION_START

        ContextCompat.startForegroundService(
            context,
            intent
        )

        call.resolve()
    }

    fun stop(call: PluginCall) {

        val intent = Intent(
            context,
            OutpassLocationService::class.java
        )

        intent.action =
            OutpassLocationService.ACTION_STOP

        context.startService(intent)

        call.resolve()
    }
}