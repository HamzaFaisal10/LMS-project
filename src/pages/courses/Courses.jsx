import { useSearchParams } from 'react-router-dom';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { useApi } from '../../hooks';
import CourseCard from '../../components/CourseCard';
import { EmptyState, Spinner } from '../../components/ui';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All levels'];

export default function Courses() {
  const [params, setParams] = useSearchParams();
  const qs = params.toString();
  const { data, loading } = useApi(`/courses?limit=12&${qs}`);
  const { data: categories } = useApi('/categories');

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };
  const q = params.get('q');

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">{q ? `Results for “${q}”` : 'Explore courses'}</h1>
      <p className="mt-1 text-ink-muted">
        {data ? `${data.total} course${data.total === 1 ? '' : 's'} available` : 'Loading…'}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <div className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </div>
          <Filter
            title="Category"
            value={params.get('category')}
            onChange={(v) => set('category', v)}
            options={(categories || []).map((c) => [c.slug, `${c.name} (${c.courseCount})`])}
          />
          <Filter
            title="Level"
            value={params.get('level')}
            onChange={(v) => set('level', v)}
            options={LEVELS.map((l) => [l, l])}
          />
          <Filter
            title="Price"
            value={params.get('price')}
            onChange={(v) => set('price', v)}
            options={[
              ['free', 'Free'],
              ['paid', 'Paid'],
            ]}
          />
          {(params.get('category') || params.get('level') || params.get('price') || q) && (
            <button onClick={() => setParams({})} className="btn-secondary w-full">
              Clear all filters
            </button>
          )}
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-end gap-2">
            <span className="text-sm text-ink-muted">Sort by</span>
            <select
              className="input w-auto"
              value={params.get('sort') || 'popular'}
              onChange={(e) => set('sort', e.target.value)}
            >
              <option value="popular">Most popular</option>
              <option value="rating">Highest rated</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>
          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner className="h-8 w-8" />
            </div>
          ) : data?.items.length ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))}
              </div>
              {data.pages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        const n = new URLSearchParams(params);
                        n.set('page', p);
                        setParams(n);
                      }}
                      className={p === data.page ? 'btn-primary' : 'btn-secondary'}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={SearchX}
              title="No courses found"
              text="Try a different search term or remove some filters."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Filter({ title, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      <div className="space-y-1.5">
        {options.map(([v, label]) => (
          <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input
              type="radio"
              className="accent-brand-600"
              checked={value === v}
              onChange={() => onChange(value === v ? null : v)}
              onClick={() => value === v && onChange(null)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
