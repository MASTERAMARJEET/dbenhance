/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    cityId?: import("./data/locations").CityId;
    /** True when middleware inferred city and should persist via Set-Cookie */
    setCityCookie?: boolean;
  }
}
