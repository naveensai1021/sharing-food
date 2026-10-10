package org.sharingfood.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class GeospatialService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates the great-circle distance between two points on the Earth
     * using the Haversine formula.
     *
     * @return Distance in kilometers
     */
    public double calculateDistanceKm(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Double.MAX_VALUE;
        }

        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
                   Math.cos(Math.toRadians(lat1.doubleValue())) * Math.cos(Math.toRadians(lat2.doubleValue())) *
                   Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return EARTH_RADIUS_KM * c;
    }
}
