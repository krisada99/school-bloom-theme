import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

interface News {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published_date: string;
}

const NewsManager = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_date", { ascending: false });

      if (error) throw error;
      setNewsList(data || []);
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
          .from("news")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("อัพเดทข่าวสารสำเร็จ");
      } else {
        const { error } = await supabase.from("news").insert([formData]);

        if (error) throw error;
        toast.success("เพิ่มข่าวสารสำเร็จ");
      }

      setFormData({ title: "", content: "", image_url: "" });
      setEditingId(null);
      fetchNews();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = (news: News) => {
    setEditingId(news.id);
    setFormData({
      title: news.title,
      content: news.content,
      image_url: news.image_url || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบข่าวสารนี้?")) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", id);

      if (error) throw error;
      toast.success("ลบข่าวสารสำเร็จ");
      fetchNews();
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: "", content: "", image_url: "" });
  };

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารใหม่"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">หัวข้อข่าว</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="กรอกหัวข้อข่าว"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">เนื้อหา</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                placeholder="กรอกเนื้อหาข่าว"
                rows={5}
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

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? "อัพเดท" : "เพิ่มข่าวสาร"}
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
        <h2 className="text-xl font-semibold">รายการข่าวสาร</h2>
        {newsList.length === 0 ? (
          <p className="text-muted-foreground">ยังไม่มีข่าวสาร</p>
        ) : (
          newsList.map((news) => (
            <Card key={news.id}>
              <CardContent className="flex items-start justify-between p-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{news.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{news.content}</p>
                  {news.image_url && (
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="mt-2 h-32 w-auto object-cover rounded"
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(news.published_date).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(news)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(news.id)}
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

export default NewsManager;