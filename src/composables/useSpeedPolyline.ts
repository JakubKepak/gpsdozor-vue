import { watch, onUnmounted, type Ref } from 'vue'
import type { PositionPoint } from '@/types/api'

function getSpeedColor(speed: number): string {
  if (speed > 130) return '#ef4444'
  if (speed > 90) return '#f59e0b'
  return '#22c55e'
}

export function useSpeedPolyline(
  mapRef: Ref<{ map?: google.maps.Map | null } | null>,
  positions: Ref<PositionPoint[]>,
) {
  let polylines: google.maps.Polyline[] = []

  function clear() {
    polylines.forEach((p) => p.setMap(null))
    polylines = []
  }

  watch(
    [() => mapRef.value?.map, positions],
    ([map, pts]) => {
      clear()
      if (!map || !pts || pts.length < 2) return

      let currentColor = getSpeedColor(pts[0].Speed)
      let currentPath: google.maps.LatLngLiteral[] = [
        { lat: Number(pts[0].Lat), lng: Number(pts[0].Lng) },
      ]

      for (let i = 1; i < pts.length; i++) {
        const color = getSpeedColor(pts[i].Speed)
        const point = { lat: Number(pts[i].Lat), lng: Number(pts[i].Lng) }

        if (color !== currentColor) {
          currentPath.push(point)
          polylines.push(
            new google.maps.Polyline({
              path: currentPath,
              geodesic: true,
              strokeColor: currentColor,
              strokeOpacity: 0.9,
              strokeWeight: 4,
              map,
            }),
          )
          currentColor = color
          currentPath = [point]
        } else {
          currentPath.push(point)
        }
      }

      if (currentPath.length >= 2) {
        polylines.push(
          new google.maps.Polyline({
            path: currentPath,
            geodesic: true,
            strokeColor: currentColor,
            strokeOpacity: 0.9,
            strokeWeight: 4,
            map,
          }),
        )
      }
    },
    { immediate: true },
  )

  onUnmounted(clear)
}
