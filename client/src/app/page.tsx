"use client";
import { Button } from "../components/ui/button";
import {
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogContent,
  Dialog,
} from "@/components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "../components/ui/table";
import { useEffect, useState } from "react";
import { getApisData } from "../api/generate-api";
import { Trash2 } from "lucide-react";

const Page = () => {
  const [listData, setListData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [data, setData] = useState<string | string[] | null>(null);
  const [file, setFile] = useState(null);

  const fetchData = async () => {
    const res = await getApisData();
    setListData(res.apis || []);
  };

  useEffect(() => {
    fetchData();
  }, [refreshData]);

  const handleSubmit = async () => {
    if (!endpoint.trim()) {
      alert("Please enter an endpoint.");
      return;
    }

    if (file) {
      const formData = new FormData();
      formData.append("endpoint", endpoint);
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8000/generate-api", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setRefreshData((prev) => !prev);
          setShowDialog(false);
          setEndpoint("");
          setFile(null);
          setData(null);
        } else {
          console.error("Failed to generate API:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to generate API:", error);
      }
    } else if (data) {
      let parsedData;
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          alert("Invalid JSON data");
          return;
        }
      } else {
        parsedData = data; // Assuming data is already an array of strings
      }

      try {
        const response = await fetch("http://localhost:8000/generate-api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint, data: parsedData }),
        });

        if (response.ok) {
          setRefreshData((prev) => !prev);
          setShowDialog(false);
          setEndpoint("");
          setFile(null);
          setData(null);
        } else {
          console.error("Failed to generate API:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to generate API:", error);
      }
    } else {
      alert("Please select a file or enter data.");
    }
  };


  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleDelete = async (endpoint: any) => {
    try {
      const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const message = await response.json();
        console.log(message);
        setRefreshData((prev) => !prev);
      } else {
        console.error("Failed to delete API:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to delete API:", error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Generate APIs
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Create and manage your APIs with ease.
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="ml-auto" variant="outline">
              Create API
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create API</DialogTitle>
              <DialogDescription>
                Enter the API endpoint and data to generate your new API.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="endpoint">
                  Endpoint
                </Label>
                <Input
                  className="col-span-3"
                  id="endpoint"
                  placeholder="/api/mydata"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right" htmlFor="data">
                  Data
                </Label>
                <Textarea
                  className="col-span-3 h-32"
                  id="data"
                  placeholder="Paste your data here..."
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="file">
                  File
                </Label>
                <Input
                  className="col-span-3"
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleSubmit}>
                Generate API
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
      <div className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listData.map((api, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{api.endpoint}</TableCell>
                <TableCell>
                  <a
                    href={api.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {api.url}
                  </a>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleDelete(api.endpoint)}
                    className="text-red-600 hover:underline"
                  >
                    <span>
                      <Trash2 />
                    </span>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
};

export default Page;
