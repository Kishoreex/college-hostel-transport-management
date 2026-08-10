package com.mdch.hosteltransport

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*

class OutpassLocationService : Service() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private lateinit var locationCallback: LocationCallback

    companion object {

        private const val CHANNEL_ID = "outpass_location_channel"
        private const val NOTIFICATION_ID = 1001

        const val ACTION_START =
            "com.mdch.hosteltransport.START_LOCATION"

        const val ACTION_STOP =
            "com.mdch.hosteltransport.STOP_LOCATION"

    }

    override fun onCreate() {
        super.onCreate()

        fusedLocationClient =
            LocationServices.getFusedLocationProviderClient(this)

        createNotificationChannel()

        locationCallback =
            object : LocationCallback() {

                override fun onLocationResult(
                    result: LocationResult
                ) {

                    for (location in result.locations) {

                        sendLocationToApp(location)
                    }
                }
            }
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {

        when (intent?.action) {

            ACTION_START -> {

                startForeground(
                    NOTIFICATION_ID,
                    createNotification()
                )

                startLocationUpdates()
            }

            ACTION_STOP -> {

                stopLocationUpdates()

                stopForeground(STOP_FOREGROUND_REMOVE)

                stopSelf()
            }
        }

        return START_STICKY
    }

    private fun startLocationUpdates() {

        val locationRequest =
            LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY,
                10000L
            )
                .setMinUpdateIntervalMillis(5000L)
                .setWaitForAccurateLocation(true)
                .build()

        try {

            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                mainLooper
            )

        } catch (e: SecurityException) {

            e.printStackTrace()
        }
    }

    private fun stopLocationUpdates() {

        fusedLocationClient.removeLocationUpdates(
            locationCallback
        )
    }

    private fun sendLocationToApp(
        location: Location
    ) {

        val intent =
            Intent(
                "com.mdch.hosteltransport.LOCATION_UPDATE"
            )

        intent.setPackage(packageName)

        intent.putExtra(
            "latitude",
            location.latitude
        )

        intent.putExtra(
            "longitude",
            location.longitude
        )

        sendBroadcast(intent)
    }

    private fun createNotification(): Notification {

        return NotificationCompat.Builder(
            this,
            CHANNEL_ID
        )
            .setContentTitle(
                "Outpass Location Tracking"
            )
            .setContentText(
                "Your location is being tracked while your outpass is active."
            )
            .setSmallIcon(
                android.R.drawable.ic_menu_mylocation
            )
            .setOngoing(true)
            .setPriority(
                NotificationCompat.PRIORITY_LOW
            )
            .build()
    }

    private fun createNotificationChannel() {

        if (Build.VERSION.SDK_INT >=
            Build.VERSION_CODES.O
        ) {

            val channel =
                NotificationChannel(
                    CHANNEL_ID,
                    "Outpass Location Tracking",
                    NotificationManager.IMPORTANCE_LOW
                )

            channel.description =
                "Location tracking for active hostel outpasses"

            val manager =
                getSystemService(
                    Context.NOTIFICATION_SERVICE
                ) as NotificationManager

            manager.createNotificationChannel(
                channel
            )
        }
    }

    override fun onBind(
        intent: Intent?
    ): IBinder? {

        return null
    }

    override fun onDestroy() {

        stopLocationUpdates()

        super.onDestroy()
    }
}