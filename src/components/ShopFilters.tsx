"use client";

import { useState } from "react";
import Link from "next/link";
import { categories, fabrics, tierConfig } from "@/lib/config";
import type { ShopFilters as Filters } from "@/lib/catalog";

interface Options {
  categories: string[];
  brands: { slug: string; name: string }[];
  sizes: string[];
  colours: string[];
}

export function ShopFilters({
  options,
  current,
  resultCount,
}: {
  options: Options;
  current: Filters;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);
  const selectedCount = ["category", "fabric", "brand", "tier", "size", "colour", "care", "q"].filter(
    (key) => Boolean(current[key as keyof Filters]),
  ).length;

  return (
    <div>
      <button
        type="button"
        className="btn btn-secondary filter-toggle mb-3"
        aria-expanded={open}
        aria-controls="shop-filters"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide filters" : `Filters${selectedCount ? ` (${selectedCount})` : ""}`}
      </button>
      <form
        id="shop-filters"
        action="/shop"
        method="get"
        className={`filter-panel ${open ? "is-open" : ""}`}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2>Filter the catalogue</h2>
          <span className="micro muted">{resultCount} pieces</span>
        </div>

        {current.pick === "1" && <input type="hidden" name="pick" value="1" />}

        <div className="filter-group">
          <label className="filter-group-label" htmlFor="filter-q">
            Search
          </label>
          <input
            id="filter-q"
            name="q"
            className="input"
            defaultValue={current.q ?? ""}
            placeholder="Shirt, hoodie, merino…"
          />
        </div>

        <div className="filter-group">
          <label className="filter-group-label" htmlFor="filter-category">
            Category
          </label>
          <select id="filter-category" name="category" className="select" defaultValue={current.category ?? ""}>
            <option value="">All categories</option>
            {options.categories.map((slug) => (
              <option key={slug} value={slug}>
                {categories.find((category) => category.slug === slug)?.label ?? slug}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-group-label" htmlFor="filter-fabric">
            Fabric
          </label>
          <select id="filter-fabric" name="fabric" className="select" defaultValue={current.fabric ?? ""}>
            <option value="">Merino or Lyocell</option>
            <option value="merino">Merino wool</option>
            <option value="lyocell">Lyocell (Tencel)</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-group-label" htmlFor="filter-brand">
            Brand
          </label>
          <select id="filter-brand" name="brand" className="select" defaultValue={current.brand ?? ""}>
            <option value="">All brands</option>
            {options.brands.map((brand) => (
              <option key={brand.slug} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-group-label" htmlFor="filter-tier">
            Price tier
          </label>
          <select id="filter-tier" name="tier" className="select" defaultValue={current.tier ?? ""}>
            <option value="">Both tiers</option>
            <option value="luxury-comfort">
              Luxury comfort · ₹{tierConfig["luxury-comfort"].min}–₹{tierConfig["luxury-comfort"].max}
            </option>
            <option value="everyday-value">
              Everyday value · ₹{tierConfig["everyday-value"].min}–₹{tierConfig["everyday-value"].max}
            </option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-group-label" htmlFor="filter-size">
            Size
          </label>
          <select id="filter-size" name="size" className="select" defaultValue={current.size ?? ""}>
            <option value="">Any size</option>
            {options.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-group-label" htmlFor="filter-colour">
            Colour
          </label>
          <select id="filter-colour" name="colour" className="select" defaultValue={current.colour ?? ""}>
            <option value="">Any colour</option>
            {options.colours.map((colour) => (
              <option key={colour} value={colour}>
                {colour}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Fabric properties</span>
          <div className="filter-options">
            <label>
              <input type="checkbox" name="care" value="easy" defaultChecked={current.care === "easy"} />
              Easy care
            </label>
            <label>
              <input type="checkbox" name="pick" value="1" defaultChecked={current.pick === "1"} />
              Butterfly Picks
            </label>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-group-label" htmlFor="filter-sort">
            Sort by
          </label>
          <select id="filter-sort" name="sort" className="select" defaultValue={current.sort ?? ""}>
            <option value="">Butterfly Picks first</option>
            <option value="new">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        <div className="filter-actions">
          <button className="btn btn-sm" type="submit">
            Apply filters
          </button>
          <Link className="filter-reset" href={current.pick === "1" ? "/shop?pick=1" : "/shop"}>
            Clear all
          </Link>
        </div>

        <p className="hint mt-3">
          Only pieces whose main fibre is Merino wool or Lyocell (at least 50%) are listed.{" "}
          <Link className="link-under" href="/fabrics">
            Why these fabrics
          </Link>
          .
        </p>
        <p className="hint mt-2">
          {fabrics.merino.name}: ₹4,000–₹4,500 guide · {fabrics.lyocell.name}: ₹500–₹600 guide for our
          own label. Partner prices are theirs.
        </p>
      </form>
    </div>
  );
}
