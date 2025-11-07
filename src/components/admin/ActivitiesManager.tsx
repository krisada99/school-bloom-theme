import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_date: string;
  location: string | null;
  image_url: string | null;
}

const ActivitiesManager = () => {
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activity_date: "",
    location: "",
    image_url: "",
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("activity_date", { ascending: false });

      if (error) throw error;
      setActivitiesList(data || []);
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
          .from("activities")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("อัพเดทกิจกรรมสำเร็จ");
      } else {
        const { error } = await supabase.from("activities").insert([formData]);

        if (error) throw error;
        toast.success("เพิ่มกิจกรรมสำเร็จ");
      }

      setFormData({
        title: "",
        description: "",
        activity_date: "",
        location: "",
        image_url: "",
      });
      setEditingId(null);
      fetchActivities();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setFormData({
      title: activity.title,
      description: activity.description,
      activity_date: new Date(activity.activity_date).toISOString().slice(0, 16),
      location: activity.location || "",
      image_url: activity.image_url || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบกิจกรรมนี้?")) return;

    try {
      const { error } = await supabase.from("activities").delete().eq("id", id);

      if (error) throw error;
      toast.success("ลบกิจกรรมสำเร็จ");
      fetchActivities();
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      activity_date: "",
      location: "",
      image_url: "",
    });
  };

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">ชื่อกิจกรรม</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="กรอกชื่อกิจกรรม"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="กรอกรายละเอียดกิจกรรม"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity_date">วันที่และเวลา</Label>
                <Input
                  id="activity_date"
                  type="datetime-local"
                  value={formData.activity_date}
                  onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">สถานที่</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="กรอกสถานที่"
                />
              </div>
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

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? "อัพเดท" : "เพิ่มกิจกรรม"}
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
        <h2 className="text-xl font-semibold">รายการกิจกรรม</h2>
        {activitiesList.length === 0 ? (
          <p className="text-muted-foreground">ยังไม่มีกิจกรรม</p>
        ) : (
          activitiesList.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="flex items-start justify-between p-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{activity.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  {activity.image_url && (
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="mt-2 h-32 w-auto object-cover rounded"
                    />
                  )}
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p>วันที่: {new Date(activity.activity_date).toLocaleString("th-TH")}</p>
                    {activity.location && <p>สถานที่: {activity.location}</p>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(activity)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(activity.id)}
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

export default ActivitiesManager;