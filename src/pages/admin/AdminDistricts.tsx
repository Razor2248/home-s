import { useState } from "react";
import { useDB } from "../../lib/store";
import { addDistrict, deleteDistrict, updateDistrict } from "../../lib/api";
import { cls } from "../../lib/format";
import { Icon } from "../../components/Icons";
import { Badge, Button, EmptyState, useToast } from "../../components/ui";
import type { District } from "../../lib/types";

export default function AdminDistricts() {
  const db = useDB();
  const { push } = useToast();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const usage = (d: District) => {
    const nW = db.workers.filter((w) => w.district === d.name).length;
    const nJ = db.jobs.filter((j) => j.district === d.name).length;
    return { nW, nJ };
  };

  const doAdd = async () => {
    const n = name.trim();
    if (n.length < 2) { push("Tên khu vực tối thiểu 2 ký tự.", "err"); return; }
    setBusy(true);
    try {
      await addDistrict(n);
      push(`Đã thêm khu vực "${n}" — hiển thị ngay ở đăng ký thợ và đăng việc.`);
      setName("");
    } catch (e) {
      push(e instanceof Error ? e.message : "Có lỗi xảy ra.", "err");
    } finally {
      setBusy(false);
    }
  };

  const doRename = async (d: District) => {
    const n = editName.trim();
    if (n.length < 2) { push("Tên khu vực tối thiểu 2 ký tự.", "err"); return; }
    setBusyId(d.id);
    try {
      await updateDistrict(d.id, { name: n });
      push("Đã đổi tên khu vực.");
      setEditingId(null);
    } catch (e) {
      push(e instanceof Error ? e.message : "Có lỗi xảy ra.", "err");
    } finally {
      setBusyId(null);
    }
  };

  const doToggle = async (d: District) => {
    setBusyId(d.id);
    try {
      await updateDistrict(d.id, { active: !d.active });
      push(d.active ? `"${d.name}" đã ẩn khỏi các biểu mẫu.` : `"${d.name}" đã hiển thị trở lại.`);
    } catch (e) {
      push(e instanceof Error ? e.message : "Có lỗi xảy ra.", "err");
    } finally {
      setBusyId(null);
    }
  };

  const doDelete = async (d: District) => {
    setBusyId(d.id);
    try {
      await deleteDistrict(d.id);
      push(`Đã xóa khu vực "${d.name}".`);
      setConfirmDel(null);
    } catch (e) {
      push(e instanceof Error ? e.message : "Có lỗi xảy ra.", "err");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="anim-fadeUp space-y-5">
      <div>
        <h2 className="font-display text-[24px] font-extrabold text-ink-900">Khu vực hoạt động</h2>
        <p className="mt-0.5 text-[13.5px] text-mute">
          Quản lý danh sách khu vực hiển thị ở <b>đăng ký thợ</b>, <b>đăng việc</b> và <b>bộ lọc tìm thợ</b>. Tắt hiển thị thay vì xóa nếu đã có dữ liệu.
        </p>
      </div>

      {/* thêm mới */}
      <div className="flex flex-wrap gap-2.5 rounded-xl border border-line bg-card p-4">
        <div className="relative min-w-[220px] flex-1">
          <Icon name="pin" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
          <input
            className="field-input pl-10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doAdd()}
            placeholder="VD: Quận 12, Gò Vấp, Nhà Bè…"
          />
        </div>
        <Button icon="plus" loading={busy} onClick={doAdd}>Thêm khu vực</Button>
      </div>

      {db.districts.length === 0 ? (
        <EmptyState icon="pin" title="Chưa có khu vực nào" desc="Thêm khu vực đầu tiên để thợ và khách bắt đầu chọn." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          {db.districts.map((d, i) => {
            const { nW, nJ } = usage(d);
            const inUse = nW + nJ > 0;
            const editing = editingId === d.id;
            return (
              <div key={d.id} className={cls("flex flex-wrap items-center gap-3 px-4 py-3.5 transition hover:bg-paper/50", i > 0 && "border-t border-line/60", !d.active && "opacity-70")}>
                <span className={cls("flex h-10 w-10 items-center justify-center rounded-xl", d.active ? "bg-safety-100 text-safety-600" : "bg-paper text-mute")}>
                  <Icon name="pin" size={18} />
                </span>

                {editing ? (
                  <div className="flex min-w-[220px] flex-1 items-center gap-2">
                    <input
                      autoFocus
                      className="field-input max-w-[260px]"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") doRename(d);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <Button size="xs" variant="good" icon="check" loading={busyId === d.id} onClick={() => doRename(d)}>Lưu</Button>
                    <Button size="xs" variant="ghost" onClick={() => setEditingId(null)}>Hủy</Button>
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className={cls("text-[14.5px] font-bold", d.active ? "text-ink-900" : "text-mute line-through decoration-2")}>{d.name}</p>
                    <p className="text-[11.5px] text-mute">
                      {nW} thợ · {nJ} việc đang dùng
                    </p>
                  </div>
                )}

                <Badge className={d.active ? "bg-good-100 text-good-700" : "bg-line/60 text-mute"}>
                  <span className={cls("h-1.5 w-1.5 rounded-full", d.active ? "bg-good-500" : "bg-mute/50")} />
                  {d.active ? "Đang hiển thị" : "Đã ẩn"}
                </Badge>

                {confirmDel === d.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-danger-600">Chắc chắn?</span>
                    <Button size="xs" variant="danger" loading={busyId === d.id} onClick={() => doDelete(d)}>Xóa</Button>
                    <Button size="xs" variant="ghost" onClick={() => setConfirmDel(null)}>Thôi</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {!editing && (
                      <Button size="xs" variant="ghost" icon="edit" onClick={() => { setEditingId(d.id); setEditName(d.name); }}>Đổi tên</Button>
                    )}
                    <button
                      onClick={() => doToggle(d)}
                      disabled={busyId === d.id}
                      title={d.active ? "Ẩn khỏi biểu mẫu" : "Hiện lại trên biểu mẫu"}
                      className={cls("relative h-6 w-11 rounded-full transition-colors disabled:opacity-50", d.active ? "bg-good-500" : "bg-line")}
                      aria-label="Bật tắt hiển thị"
                    >
                      <span className={cls("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", d.active ? "left-[22px]" : "left-0.5")} />
                    </button>
                    <Button
                      size="xs"
                      variant="ghost"
                      icon="trash"
                      disabled={inUse}
                      onClick={() => setConfirmDel(d.id)}
                      className={cls(!inUse && "text-danger-600 hover:bg-danger-100")}
                      title={inUse ? "Đang có thợ/việc sử dụng — không thể xóa" : "Xóa khu vực"}
                    >
                      Xóa
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-line bg-paper p-4">
        <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-mute">
          <Icon name="alert" size={15} className="mt-0.5 shrink-0 text-warn-600" />
          <span>
            <b className="text-ink-800">Lưu ý nghiệp vụ:</b> tên khu vực được lưu trực tiếp vào phiếu việc và hồ sơ thợ.
            Khi đổi tên, dữ liệu cũ vẫn giữ tên cũ — nên thêm khu vực mới hoặc tắt hiển thị thay vì đổi tên quá nhiều.
          </span>
        </p>
      </div>
    </div>
  );
}
