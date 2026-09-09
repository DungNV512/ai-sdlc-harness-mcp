# proguard-rules.pro — Flutter app Android baseline
# R8 full mode is enabled via build.gradle: android.enableR8.fullMode=true
# Update this file whenever a new library is added that requires keep rules.

# ── Dart / Flutter generated code ─────────────────────────────────────────────

# json_serializable / freezed: preserve fromJson/toJson and generated factories
-keepclassmembers class ** {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class **$* { *; }
-keepnames class ** implements com.squareup.moshi.JsonAdapter

# Retrofit: keep retrofit annotations and service interfaces
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response
-keepattributes Signature, InnerClasses, EnclosingMethod, Exceptions

# OkHttp (used by Dio under the hood on Android)
-dontwarn okhttp3.internal.platform.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# ── Drift / SQLite ─────────────────────────────────────────────────────────────

-keep class **.drift.** { *; }
-keep class **.AppDatabase* { *; }
-keepclassmembers class ** extends drift.GeneratedDatabase { *; }

# ── Hive CE ─────────────────────────────────────────────────────────────────────

-keep class **.HiveObject { *; }
-keepclassmembers class ** extends hive.HiveObject { *; }
-keep @hive.annotations.HiveType class * { *; }

# ── Firebase ────────────────────────────────────────────────────────────────────

# Firebase Messaging — rules automatically included via google-services plugin.
# Crashlytics — rules automatically included.
# If the plugin doesn't include them, add:
# -keep class com.google.firebase.** { *; }
# -keep class com.google.android.gms.** { *; }

# ── Flutter Secure Storage ──────────────────────────────────────────────────────

-keep class com.it_nomads.fluttersecurestorage.** { *; }

# ── Play Integrity ───────────────────────────────────────────────────────────────

-keep class com.google.android.play.core.integrity.** { *; }

# ── Kotlin serialization ────────────────────────────────────────────────────────

-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

# ── Suppress expected missing class warnings from SDK tools ─────────────────────

-dontwarn sun.misc.Unsafe
-dontwarn java.lang.ClassValue
-dontwarn com.android.tools.r8.**

# ── Preserve line numbers for stack traces uploaded to Sentry ───────────────────

-keepattributes SourceFile, LineNumberTable
-renamesourcefileattribute SourceFile
