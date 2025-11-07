import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

interface Staff {
  id: string;
  full_name: string;
  position: string;
  department: string | null;
  email: string | null;
  phone: string | null;
  image_url: string | null;
  bio: string | null;
}

const StaffManager = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    image_url: "",
    bio: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStaffList(data || []);
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from("staff")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("อัพเดทข้อมูลบุคลากรสำเร็จ");
      } else {
        const { error } = await supabase.from("staff").insert([formData]);

        if (error) throw error;
        toast.success("เพิ่มบุคลากรสำเร็จ");
      }

      setFormData({
        full_name: "",
        position: "",
        department: "",
        email: "",
        phone: "",
        image_url: "",
        bio: "",
      });
      setEditingId(null);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingId(staff.id);
    setFormData({
      full_name: staff.full_name,
      position: staff.position,
      department: staff.department || "",
      email: staff.email || "",
      phone: staff.phone || "",
      image_url: staff.image_url || "",
      bio: staff.bio || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบบุคลากรนี้?")) return;

    try {
      const { error } = await supabase.from("staff").delete().eq("id", id);

      if (error) throw error;
      toast.success("ลบบุคลากรสำเร็จ");
      fetchStaff();
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      full_name: "",
      position: "",
      department: "",
      email: "",
      phone: "",
      image_url: "",
      bio: "",
    });
  };

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มบุคลากรใหม่"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">ตำแหน่ง</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                  placeholder="กรอกตำแหน่ง"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">แผนก</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="กรอกแผนก"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="กรอกอีเมล"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทร</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="กรอกเบอร์โทร"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL รูปภาพ</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">ประวัติ/รายละเอียด</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="กรอกประวัติหรือรายละเอียดเพิ่มเติม"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? "อัพเดท" : "เพิ่มบุคลากร"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  ยกเลิก
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">รายการบุคลากร</h2>
        {staffList.length === 0 ? (
          <p className="text-muted-foreground">ยังไม่มีข้อมูลบุคลากร</p>
        ) : (
          staffList.map((staff) => (
            <Card key={staff.id}>
              <CardContent className="flex items-start justify-between p-6">
                <div className="flex gap-4 flex-1">
                  {staff.image_url && (
                    <img
                      src={staff.image_url}
                      alt={staff.full_name}
                      className="h-24 w-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{staff.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{staff.position}</p>
                    {staff.department && (
                      <p className="text-sm text-muted-foreground">แผนก: {staff.department}</p>
                    )}
                    {staff.email && (
                      <p className="text-sm text-muted-foreground">อีเมล: {staff.email}</p>
                    )}
                    {staff.phone && (
                      <p className="text-sm text-muted-foreground">โทร: {staff.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(staff)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(staff.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffManager;